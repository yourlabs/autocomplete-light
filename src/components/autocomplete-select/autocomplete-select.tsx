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

    // ensure all selected options are in deck
    Array.from(
      this.select.querySelectorAll('option[selected]')
    ).map((option) => {
      var cmp = document.createElement('div')
      cmp.setAttribute('selected', 'selected')
      cmp.setAttribute('data-value', option.getAttribute('value'))
      cmp.innerHTML = option['innerHTML']
      this.choiceSelect(cmp, false)
    })

    // ensure all deck values are in select
    Array.from(
      this.deck.querySelectorAll('[data-value]')
    ).map((choice) => {
        if (!this.select.querySelector('option[value="' + choice.getAttribute('data-value') + '"]')) {
          this.choiceSelect(choice, false)
        }
        this.addClear(choice)
    })
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
      option.removeAttribute('selected')
    }

    var decked = this.deck.querySelector('[data-value="' + value + '"]')
    if (decked) {
      decked.parentNode.removeChild(decked)
    }

    if (!noShowHide)
      this.input.hidden = this.maxChoices && this.selected.length >= this.maxChoices

    this.changeTrigger()
  }

  choiceSelect(choice: any, trigger: boolean = true, option: any = false) {
    console.log('choiceSelect', choice)

    if (this.maxChoices && this.selected.length >= this.maxChoices) {
      this.choiceUnselect(this.selected[0], true)
    }

    var value = choice.getAttribute('data-value')

    // insert option in select if not present
    option = this.select.querySelector('option[value="' + value + '"]')
    if (!option) {
      option = document.createElement('option')
      option.setAttribute('value', value)
      option.innerHTML = choice.innerHTML
      this.select.appendChild(option)
      console.log('select new option', option)
    }
    option.setAttribute('selected', 'selected')

    // insert choice on deck if not present, based on a choice node clone
    if (! this.deck.querySelector('[data-value="' + value + '"]')) {
      choice = choice.cloneNode(9)
      choice.classList.remove('hilight')
      this.addClear(choice)
      this.deck.appendChild(choice)
      console.log('deck new choice', choice)
    }

    this.input.hidden = this.maxChoices && this.selected.length >= this.maxChoices

    trigger && this.changeTrigger()
  }

  changeTrigger() {
    this.select.dispatchEvent(
      new Event('change', {bubbles: true, cancelable: false})
    )
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
