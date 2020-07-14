import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @Prop({
    mutable: true,
    reflect: true
  }) value: string
  xhr: XMLHttpRequest
  timeoutId: number

  input(ev: any) {
    this.value = ev.target.value

    this.xhr && this.xhr.readyState === 0 && this.xhr.abort();
    this.timeoutId && window.clearTimeout(this.timeoutId)
    this.timeoutId = window.setTimeout(() => this.download(), 200)
  }

  download() {
    this.xhr = new XMLHttpRequest()
    this.xhr.addEventListener('load', function() {
      console.log(this.responseText)
    })
    this.xhr.open('GET', 'https://api.github.com/users/jpic/orgs')
    this.xhr.send()
  }

  render() {
    return <span>
      <input
        type="text"
        value={this.value}
        onInput={this.input}
      />
      <span class="box"></span>
    </span>;
  }
}
