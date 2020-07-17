import { Component, Element, Host, Prop, h } from '@stencil/core';


@Component({
  tag: 'autocomplete-light',
  styleUrl: 'autocomplete-light.css'
})
export class AutocompleteLight {
  @Prop({
    mutable: true,
    reflect: true
  }) value = ''
  @Prop() choiceSelector = '[data-value]'
  @Prop() minimumCharacters = 1
  @Prop() url: string
  @Prop() classInput = 'vTextField'
  @Prop() classBox = 'box'
  @Element() el: HTMLElement

  xhr: XMLHttpRequest
  timeoutId: number
  bound = false
  boxElement: any

  onChoiceMouseEnter(ev: any) {
    this.hilight(ev.target)
  }

  hilight(choice: any) {
    this.selected.forEach((item) => item.classList.remove('hilight'))
    choice.classList.add('hilight')
  }

  onChoiceMouseLeave(ev: any) {
    ev.target.classList.remove('hilight')
  }

  onChoiceMouseDown(ev: any) {
    this.selectChoice(ev.target)
  }

  selectChoice(choice: any) {
    this.trigger('autocompleteChoiceSelected', {choice})
    this.hide()
  }

  trigger(eventName, data) {
    if (window.CustomEvent && typeof window.CustomEvent === 'function') {
      var event = new CustomEvent(eventName, {detail: data});
    } else {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, data);
    }
    this.el.dispatchEvent(event)
  }

  onInput(ev: any) {
    this.value = ev.target.value
    // clear any unset xhr
    this.xhr && this.xhr.readyState === 0 && this.xhr.abort()
    // clear any planned xhr
    this.timeoutId && window.clearTimeout(this.timeoutId)
    // plan an xhr
    this.timeoutId = window.setTimeout(this.download.bind(this), 200)
  }

  download() {
    if (this.url) {
      this.xhr = new XMLHttpRequest()
      this.xhr.addEventListener('load', this.receive.bind(this))
      this.xhr.open('GET', this.url)
      this.xhr.send()
    } else {
      // test mode
      this.receive({
        target: {
          response: ['aaa', 'aab', 'abb', 'bbb'].filter(
            (item) => item.startsWith(this.value)
          ).map(
              (item) => `<div data-value="${item}">${item}</div>`
          ).join('\n'),
        }
      })
    }
  }

  get input() {
    console.log('tst')
    return this.el.querySelector('input[type=text]')
  }

  get box() {
    if (!this.boxElement) {
      this.boxElement = document.createElement('div')
      this.boxElement.classList.add('autocomplete-light-box')
      window.addEventListener('resize', this.position.bind(this))
      document.querySelector('body').appendChild(this.boxElement)
    }
    return this.boxElement
  }

  position() {
    var rect = this.input.getBoundingClientRect()
    this.boxElement.style.top = rect.bottom + 'px'
    this.boxElement.style.left = rect.left + 'px'
    this.boxElement.style.width = rect.width + 'px'
  }

  get choices() {
    return Array.from(this.box.querySelectorAll(this.choiceSelector))
  }

  get selected() {
    return this.box.querySelectorAll(this.choiceSelector + '.hilight')
  }

  receive(ev: any) {
    this.position()
    this.box.innerHTML = ev.target.response
    this.box.querySelectorAll(this.choiceSelector).forEach((item) => {
      if (item.getAttribute('data-bound')) return
      item.addEventListener('mouseenter', this.onChoiceMouseEnter.bind(this))
      item.addEventListener('mouseleave', this.onChoiceMouseLeave.bind(this))
      item.addEventListener('mousedown', this.onChoiceMouseDown.bind(this))
      item.setAttribute('data-bound', 'true')
    })
  }

  hide() {
    this.box.setAttribute('hidden', 'true')
  }

  show() {
    this.box.removeAttribute('hidden')
  }

  visible() {
    this.box.getAttribute('hidden')
  }

  onInputFocus() {
    this.show()
  }

  onInputBlur() {
    this.hide()
  }

  move(ev: any) {
    // If the autocomplete should not be displayed then return.
    if (this.value.length < this.minimumCharacters) return true;

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
    this.show();

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

  onInputKeyup(ev: any) {
    switch(ev.keyCode) {
      case 40: // down arrow
      case 38: // up arrow
      case 16: // shift
      case 17: // ctrl
      case 18: // alt
        this.move(ev);
        break;

      case 9: // tab
      case 13: // enter
        if (!this.visible) return

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
        this.hide()
        break
    }
  }

  refresh() {
    if (!this.value) return
    if (this.value.length < this.minimumCharacters)
      this.hide()
    else
      this.download()
  }

  componentDidRender() {
    if (this.input !== null && !this.input.getAttribute('data-bound')) {
      this.input.addEventListener('blur', this.onInputBlur.bind(this))
      this.input.addEventListener('focus', this.onInputFocus.bind(this))
      this.input.addEventListener('keyup', this.onInputKeyup.bind(this))
      this.input.addEventListener('input', this.onInput.bind(this))
      this.input.setAttribute('data-bound', 'true')
    }
  }

  render() {
    return <Host class="autocomplete-light">
        <slot name="input" />
        <span class="clear" hidden={!this.value.length} onClick={() => this.value = ''}>✖</span>
      </Host>;
  }
}
