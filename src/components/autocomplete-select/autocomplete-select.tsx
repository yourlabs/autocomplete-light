import { Component, Element, Host, Prop, h } from '@stencil/core'

@Component({
  tag: 'autocomplete-select',
  styleUrl: 'autocomplete-select.css'
})
export class AutocompleteSelect {
  @Element() el: HTMLElement
  @Prop() name: string
  @Prop() maxChoices = 0
  @Prop() multiple = false
  @Prop() url: string
  bound = false

  connectedCallback() {
    if (!this.multiple) {
      this.maxChoices = 1
    }

    Array.from(
      this.deck.querySelectorAll('[data-value]')
    ).map((item) => this.addClear(item))
  }

  get deck() {
    return this.el.querySelector('[slot=deck]')
  }

  get select() {
    return this.el.querySelector('[slot=select]')
  }

  get selected() {
    return this.deck.querySelectorAll('[data-value]')
  }

  get input() {
    return this.el.querySelector('autocomplete-light')
  }

  onClearClick(ev: any) {
    this.choiceUnselect(ev.target.parentNode)
  }

  choiceUnselect(choice: any, noShowHide = false) {
    var value = choice.getAttribute('data-value')

    var option = this.select.querySelector('option[value="' + value + '"]')
    if (option) {
      option.parentNode.removeChild(option)
    }

    var decked = this.deck.querySelector('[data-value="' + value + '"]')
    if (decked) {
      decked.parentNode.removeChild(decked)
    }

    if (!noShowHide)
      this.input.hidden = this.maxChoices && this.selected.length >= this.maxChoices
  }

  choiceSelect(choice: any) {
    if (this.maxChoices && this.selected.length >= this.maxChoices) {
      this.choiceUnselect(this.selected[0], true)
    }

    // insert option in select
    var option = document.createElement('option')
    option.setAttribute('value', choice.getAttribute('data-value'))
    option.setAttribute('selected', 'selected')
    this.select.appendChild(option)

    // insert choice on deck, based on a choice node clone
    choice = choice.cloneNode(9)
    choice.classList.remove('hilight')
    this.addClear(choice)
    this.deck.appendChild(choice)

    this.input.hidden = this.maxChoices && this.selected.length >= this.maxChoices
  }

  addClear(choice: any) {
    if (choice.querySelector('.clear'))
      return
    var clear = document.createElement('span')
    clear.classList.add('clear')
    clear.addEventListener('click', this.onClearClick.bind(this))
    clear.innerHTML = '✖'
    choice.appendChild(clear)
  }

  componentDidRender() {
    if (!this.input.getAttribute('data-bound')) {
      this.input.addEventListener(
        'autocompleteChoiceSelected',
        (ev: any) => this.choiceSelect(ev.detail.choice)
      )
      this.input.setAttribute('data-bound', 'true')
    }
    this.input.hidden = this.maxChoices && this.selected.length >= this.maxChoices
  }

  render() {
    return <Host class="autocomplete-select">
      <slot name="select" />
      <slot name="deck" />
      <slot name="input" />
    </Host>;
  }
}
