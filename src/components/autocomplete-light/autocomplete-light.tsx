import { Component, Element, Prop, h } from '@stencil/core';

@Component({
  tag: 'autocomplete-light',
  styleUrl: 'autocomplete-light.css',
  shadow: true
})
export class AutocompleteLight {
  @Prop({
    mutable: true,
    reflect: true
  }) value: string
  @Prop() boxContent: string
  @Prop() choiceSelector = '[data-value]'
  @Prop() minimumCharacters = 1
  @Element() el: HTMLElement

  xhr: XMLHttpRequest
  timeoutId: number
  url: string
  bound = false

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
      this.xhr.open('GET', 'https://www.mrs.beta.gouv.fr/institution/310000000/mrsrequest/iframe/?origin=http://localhost:3333/')
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
    return this.el.shadowRoot.querySelector('input[type=text]')
  }

  get box() {
    return this.el.shadowRoot.querySelector('.box')
  }

  get choices() {
    return Array.from(this.el.shadowRoot.querySelectorAll(this.choiceSelector))
  }

  get selected() {
    return this.el.shadowRoot.querySelectorAll(this.choiceSelector + '.hilight')
  }

  receive(ev: any) {
    this.boxContent = ev.target.response
  }

  hide() {
    this.box.classList.add('hidden')
  }

  show() {
    this.box.classList.remove('hidden')
  }

  get visible() {
    return ! this.box.classList.contains('hidden')
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
        if (!this.visible) return
        this.hide()
        break

      default:
        this.refresh()
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
    if (this.input !== null && !this.bound) {
      this.input.addEventListener('blur', this.onInputBlur.bind(this))
      this.input.addEventListener('focus', this.onInputFocus.bind(this))
      this.input.addEventListener('keyup', this.onInputKeyup.bind(this))
      this.bound = true
    }

    this.box.querySelectorAll(this.choiceSelector).forEach((item) => {
      item.addEventListener('mouseenter', this.onChoiceMouseEnter.bind(this))
      item.addEventListener('mouseleave', this.onChoiceMouseLeave.bind(this))
      item.addEventListener('mousedown', this.onChoiceMouseDown.bind(this))
    })
  }

  render() {
    return <span class="container">
      <input
        type="text"
        value={this.value}
        onInput={this.onInput.bind(this)}
      />
      <span
        class="box hidden"
        innerHTML={this.boxContent}
      />
    </span>;
  }
}
