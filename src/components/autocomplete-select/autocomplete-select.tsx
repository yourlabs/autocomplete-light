import { Component, Element, Host, Prop, h } from '@stencil/core'

@Component({
  tag: 'autocomplete-select',
  styleUrl: 'autocomplete-select.css',
  shadow: true
})
export class AutocompleteSelect {
  @Element() el: HTMLElement
  @Prop() name: string
  @Prop({
    mutable: true
  }) values: Array<any>
  @Prop() maxChoices: any
  bound = false

  connectedCallback() {
    if (!this.el.getAttribute('multiple')) {
      this.maxChoices = 1
    }
    this.values = Array.from(this.el.querySelectorAll('[selected]')).map(
      (item) => [item.getAttribute('value'), item.innerHTML]
    )
  }

  get deck() {
    return this.el.shadowRoot.querySelector('.deck')
  }

  get select() {
    return this.el.shadowRoot.querySelector('select')
  }

  get autocomplete() {
    return this.el.shadowRoot.querySelector('autocomplete-light')
  }

  onClearClick(ev: any) {
    this.choiceUnselect(ev.target.parentNode)
  }

  choiceUnselect(choice: any) {
    this.values = this.values.filter(
      (item) => item[0] != choice.getAttribute('data-value')
    )
  }

  choiceSelect(choice: any) {
    this.values = [
      ...this.values,
      [
        choice.getAttribute('data-value'),
        choice.innerHTML,
      ]
    ]
  }

  componentDidRender() {
    if (!this.bound) {
      this.autocomplete.addEventListener(
        'autocompleteChoiceSelected',
        (ev: any) => this.choiceSelect(ev.detail.choice)
      )
      this.bound = true
    }
  }

  render() {
    return <Host>
      <select name={this.name}>
        {this.values.map((item) => (
          <option value={item[0]} selected>
            {item[1]}
          </option>
        ))}
      </select>
      <span class="deck">
        {this.values.map((item) => (
          <span data-value={item[0]}>
            {item[1]}
            <span class="clear" onClick={this.onClearClick.bind(this)}>✖</span>
          </span>
        ))}
      </span>
      <autocomplete-light />
    </Host>;
  }
}
