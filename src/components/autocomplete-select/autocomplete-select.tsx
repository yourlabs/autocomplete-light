import { Component, Element, Host, Prop, h } from '@stencil/core'

@Component({
  tag: 'autocomplete-select',
  styleUrl: 'autocomplete-select.css'
})
export class AutocompleteSelect {
  @Element() el: HTMLElement
  @Prop() name: string
  @Prop({
    mutable: true,
    reflect: true
  }) values: Array<any>
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
    return this.el.querySelector('[slot=input]')
  }

  onClearClick(ev: any) {
    this.choiceUnselect(ev.target.parentNode)
  }

  choiceUnselect(choice: any) {
    var value = choice.getAttribute('data-value')

    var option = this.select.querySelector('option[value="' + value + '"]')
    if (option) {
      option.parentNode.removeChild(option)
    }

    var decked = this.deck.querySelector('[data-value="' + value + '"]')
    if (decked) {
      decked.parentNode.removeChild(decked)
    }
  }

  choiceSelect(choice: any) {
    if (this.maxChoices && this.selected.length >= this.maxChoices) {
      this.choiceUnselect(this.selected[0])
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
    if (!this.bound) {
      this.input.addEventListener(
        'autocompleteChoiceSelected',
        (ev: any) => this.choiceSelect(ev.detail.choice)
      )
      this.bound = true
    }
  }

  render() {
    return <Host class="autocomplete-select">
      <slot name="select" />
      <slot name="deck" />
      <slot name="input" />
    </Host>;
  }
}
