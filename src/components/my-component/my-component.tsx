import { Component, Prop, h } from '@stencil/core';
import { format } from '../../utils/utils';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @Prop({
    reflect: true
  }) value: string;

  render() {
    return <span><input type="text" value={this.value} /></span>;
  }
}
