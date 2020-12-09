# boydog no OT

This is the pipeline:
on html input -> update front flat scope (non-reactive reference) -> server scope -> update front flat scope (if different) -> update html

There is a scope in html and it is flat. The server scope is deep.

Interesting resources:

 - Simple two way binding: https://www.npmjs.com/package/two-way-binding
 - Two way binding with for loop: https://blikblum.github.io/tinybind/docs/guide/
 - Seems the same as above: https://github.com/mikeric/rivets

## Internals

This section describes how each attribute works internally.
### Looping (`bd-loop`):

Given the scope:

```js
let scope = {
  "text": "some text",
  "items>0>todo": "get milk",
  "items>1>todo": "buy meat",
  "items>2>todo": "fix car",
}
```

And the HTML:

```html
<li bd-loop="items>\d+>">
    <p>todo: <input bd-value="$$todo" /></p>
</li>
```

The `bd-loop` regex will match `["items>0>", "items>1>", "items>2>"]`. Each item is then saved into `$$` so that the resulting HTML will be:

```html
<li bd-loop="items>\d+>" _bd-key="0">
    <p>todo: <input bd-value="items>0>todo" _bd-value-original="$$todo" /></p>
</li>
<li _bd-key="1">
    <p>todo: <input bd-value="items>1>todo" /></p>
</li>
<li _bd-key="2">
    <p>todo: <input bd-value="items>2>todo" /></p>
</li>
```

This process, step by step happened as follows. Given the initial HTML,

```html
<li bd-loop="items>\d+>">
    <p>todo: <input bd-value="$$todo" /></p>
</li>
```

This DOM structure saved into `blueprintView` and the `bd-loop` attribute is removed. Therefore `blueprintView` is equal to:

```html
<li>
    <p>todo: <input bd-value="$$todo" /></p>
</li>
```

The intial HTML element is then keyed `_bd-key="0"`:

```html
<li bd-loop="items>\d+>" _bd-key="0">
    <p>todo: <input bd-value="$$todo" /></p>
</li>
```

This element's children are scanned to see if any `bd-*` attribute of a children element contains `$$`, `$>` or `$<` that is directly under the `bd-loop` we are processing. Since there are matches, each found instance gets this attribute copied into `_bd-[type]-original` resulting in:

```html
<li bd-loop="items>\d+>" _bd-key="0">
    <p>todo: <input bd-value="$$todo" _bd-value-original="$$todo"/></p>
</li>
```

Matches are then calculated. Since `["items>0>", "items>1>", "items>2>"].length` is 3. We create and append 2 more instances of `blueprintView`, attributed `_bd-key` relative to the loop iteration. This results in:

```html
<li bd-loop="items>\d+>" _bd-key="0">
    <p>todo: <input bd-value="$$todo" _bd-value-original="$$todo"/></p>
</li>
<li _bd-key="1">
    <p>todo: <input bd-value="$$todo" /></p>
</li>
<li _bd-key="2">
    <p>todo: <input bd-value="$$todo" /></p>
</li>
```

We iterate again each `_bd-key` and replace any `$$`, `$>` or `$<` found by the value from the matches. Resulting in:

```html
<li bd-loop="items>\d+>" _bd-key="0">
    <p>todo: <input bd-value="items>0>todo" _bd-value-original="$$todo" /></p>
</li>
<li _bd-key="1">
    <p>todo: <input bd-value="items>1>todo" /></p>
</li>
<li _bd-key="2">
    <p>todo: <input bd-value="items>2>todo" /></p>
</li>
```

The structure above is now  good to be processed by the binder.



