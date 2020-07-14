import { Component, Element, Host, h } from '@stencil/core'
import { AutocompleteLight } from '../autocomplete-light/autocomplete-light'

@Component({
  tag: 'autocomplete-select',
  shadow: true
})
export class AutocompleteSelect {
  @Element() el: HTMLElement

  connectedCallback() {
    console.log(this.el)
  }

  render() {
    return <Host>
      <AutocompleteLight />
    </Host>;
  }
}
