import { Component, Element, Host, Prop, h } from '@stencil/core';


class AutocompleteMachine {
  xhr: XMLHttpRequest
  timeoutId: number
  input: HTMLInputElement
  box: HTMLElement
  host: HTMLElement
  clear: HTMLElement
  options = {
    url: null,
    minimumCharacters: 0,
    choiceSelector: '[data-value]'
  }

  constructor(host, input, clear, options) {
    this.host = host
    this.input = input
    this.clear = clear
    this.options = options

    if (!this.input.getAttribute('data-bound')) {
      this.input.addEventListener(
        'focus',
        () => this.input.value.length >= this.options.minimumCharacters && this.onInput()
      )
      this.input.addEventListener('keyup', this.keyboard.bind(this))
      this.input.addEventListener('input', this.onInput.bind(this))
      this.input.setAttribute('data-bound', 'true')
      window.addEventListener('resize', this.draw.bind(this))
    }
  }

  onInput() {
    if (! this.input.value) {
      this.clear.setAttribute('hidden', 'true')
    } else {
      this.clear.removeAttribute('hidden')
    }
    // clear any unset xhr
    this.xhr && this.xhr.readyState === 0 && this.xhr.abort()
    // clear any planned xhr
    this.timeoutId && window.clearTimeout(this.timeoutId)
    // plan an xhr
    this.timeoutId = window.setTimeout(this.download.bind(this), 200)
  }

  hilight(choice: any) {
    this.selected.forEach((item) => item.classList.remove('hilight'))
    choice.classList.add('hilight')
  }

  selectChoice(choice: any) {
    let eventName = 'autocompleteChoiceSelected'
    let data = {choice}
    if (window.CustomEvent && typeof window.CustomEvent === 'function') {
      var event = new CustomEvent(eventName, {detail: data});
      this.host.dispatchEvent(event)
    } else {
      var event2 = document.createEvent('CustomEvent');
      event2.initCustomEvent(eventName, true, true, data);
      this.host.dispatchEvent(event2)
    }
    this.box.setAttribute('hidden', 'true')
  }

  download() {
    if (this.options.url) {
      this.xhr = new XMLHttpRequest()
      this.xhr.addEventListener('load', this.receive.bind(this))
      this.xhr.open('GET', this.options.url)
      this.xhr.send()
    } else if (this.host.parentNode['tagName'] == 'AUTOCOMPLETE-SELECT') {
      this.receive({
        target: {
          response: Array.from(
              this.host.parentNode.querySelectorAll('option')
          ).map(
            (item) => `<div data-value="${item.getAttribute('value')}">${item.innerHTML}</div>`
          ).join('\n'),
        }
      })
    } else {
      // test mode
      this.receive({
        target: {
          response: ['aaa', 'aab', 'abb', 'bbb'].filter(
            (item) => item.startsWith(this.input.value)
          ).map(
              (item) => `<div data-value="${item}">${item}</div>`
          ).join('\n'),
        }
      })
    }
  }


  keyboard(ev: any) {
    switch(ev.keyCode) {
      case 40: // down arrow
      case 38: // up arrow
      case 16: // shift
      case 17: // ctrl
      case 18: // alt
        this.move(ev);
        break;

      case 13: // enter
        if (this.box.getAttribute('hidden')) return

        var choice = this.box.querySelector('.hilight');

        if (!choice) {
            // Don't get in the way, let the browser submit form or focus
            // on next element.
            return
        }

        ev.preventDefault()
        ev.stopPropagation()

        this.selectChoice(choice)
        break

      case 27: // escape
        this.box.setAttribute('hidden', 'true')
        break
    }
  }

  move(ev: any) {
    // If the autocomplete should not be displayed then return.
    if (this.input.value.length < this.options.minimumCharacters) return true;

    // Avoid moving the cursor in the input.
    ev.preventDefault()
    ev.stopPropagation()

    // The current choice if any.
    var current = this.box.querySelector('.hilight');

    // If not KEY_UP or KEY_DOWN, then return.
    // NOTE: with Webkit, both keyCode and charCode are set to 38/40 for &/(.
    //       charCode is 0 for arrow keys.
    //       Ref: http://stackoverflow.com/a/12046935/15690
    var way;
    if (ev.keyCode === 38 && !ev.charCode) way = 'up';
    else if (ev.keyCode === 40 && !ev.charCode) way = 'down';
    else return;

    // The first and last choices. If the user presses down on the last
    // choice, then the first one will be hilighted.
    var first = this.choices[0];
    var last = this.choices[this.choices.length - 1];

    // The choice that should be hilighted after the move.
    var target;

    // The autocomplete must be shown so that the user sees what choice
    // he is hilighting.
    this.draw()

    // If a choice is currently hilighted:
    if (current) {
      if (way === 'up') {
        var next = this.choices.indexOf(current) - 1
        target = next < 0 ? last : this.choices[next]
      } else {
        var next = this.choices.indexOf(current) + 1
        target = next >= this.choices.length ? first : this.choices[next]
      }
    } else {
      target = way === 'up' ? last : first;
    }

    this.hilight(target)
  }

  get choices() {
    return Array.from(this.box.querySelectorAll(this.options.choiceSelector))
  }

  get selected() {
    return this.box.querySelectorAll(this.options.choiceSelector + '.hilight')
  }

  receive(ev: any) {
    this.draw()
    this.box.innerHTML = ev.target.response
    this.box.querySelectorAll(this.options.choiceSelector).forEach((item) => {
      // item idempotence
      if (item.getAttribute('data-bound'))
        return

      // bind mouse events
      item.addEventListener(
        'mouseenter',
        (ev: any) => this.hilight(ev.target)
      )
      item.addEventListener(
        'mouseleave',
        (ev: any) => ev.target.classList.remove('hilight')
      )
      item.addEventListener(
        'mousedown',
        (ev: any) => this.selectChoice(ev.target)
      )

      // idempotence mark
      item.setAttribute('data-bound', 'true')
    })
  }

  boxBuild() {
    this.box = document.createElement('div')
    this.box.classList.add('autocomplete-light-box')
    document.querySelector('body').appendChild(this.box)


    this.input.addEventListener(
      'focusout',
      () => this.box.setAttribute('hidden', 'true')
    )
    this.input.addEventListener(
      'blur',
      () => this.box.setAttribute('hidden', 'true')
    )
  }

  draw() {
    if (!this.box) this.boxBuild()
    var rect = this.input.getBoundingClientRect()
    this.box.style.top = rect.bottom + 'px'
    // keep some space for the border, avoid overflow on x
    this.box.style.left = rect.left - 2 + 'px'
    this.box.style.width = rect.width - 2  + 'px'
    this.box.removeAttribute('hidden')
  }
}

@Component({
  tag: 'autocomplete-light',
  styleUrl: 'autocomplete-light.css'
})
export class AutocompleteLight {
  @Prop() choiceSelector = '[data-value]'
  @Prop() minimumCharacters = 0
  @Prop() url: string
  @Prop({
    mutable: true,
    reflect: true
  }) hidden = false
  @Element() host: HTMLElement
  input: HTMLInputElement
  autocomplete: AutocompleteMachine
  clear: HTMLElement

  render() {
    return <Host class="autocomplete-light">
      <slot name="input" />
      <span
        class="clear"
        onClick={() => this.input.value = ''}
      >✖</span>
    </Host>;
  }

  componentDidRender() {
    this.input = this.host.querySelector('[slot=input]')
    this.clear = this.host.querySelector('.clear')
    if (this.hidden) {
      this.input.setAttribute('hidden', 'true')
      this.clear.setAttribute('hidden', 'true')
    } else {
      this.input.removeAttribute('hidden')
      if (this.input.value.length > 0) {
        this.clear.removeAttribute('hidden')
      } else {
        this.clear.setAttribute('hidden', 'true')
      }
    }
    this.autocomplete = new AutocompleteMachine(
      this.host,
      this.input,
      this.clear,
      this
    )
  }
}
