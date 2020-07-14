import { Component, Element, Host, Prop, h } from '@stencil/core'

@Component({
  tag: 'autocomplete-select',
  shadow: true
})
export class AutocompleteSelect {
  @Element() el: HTMLElement
  @Prop({
    mutable: true
  }) value: string

  connectedCallback() {
    var value = this.el.querySelector('[selected]')
    if (value) {
      this.value = value.getAttribute('value')
    }
  }

  get deck() {
    return this.el.shadowRoot.querySelector('.deck')
  }

  render() {
    return <Host>
      <span class="deck">
        <autocomplete-light />
      </span>
    </Host>;
  }
}
