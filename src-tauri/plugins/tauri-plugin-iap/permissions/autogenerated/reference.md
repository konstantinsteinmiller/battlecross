## Default Permission

Default permissions for the IAP plugin: read the full-version product and its price, buy it, restore purchases, read the entitlement, and the framework-provided event-listener commands needed for `addPluginListener` to subscribe to entitlement-changed.

#### This default permission set includes the following:

- `allow-get-product`
- `allow-purchase`
- `allow-restore`
- `allow-get-entitlement`
- `allow-registerListener`
- `allow-removeListener`

## Permission Table

<table>
<tr>
<th>Identifier</th>
<th>Description</th>
</tr>


<tr>
<td>

`iap:allow-get-entitlement`

</td>
<td>

Enables the get_entitlement command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:deny-get-entitlement`

</td>
<td>

Denies the get_entitlement command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:allow-get-product`

</td>
<td>

Enables the get_product command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:deny-get-product`

</td>
<td>

Denies the get_product command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:allow-purchase`

</td>
<td>

Enables the purchase command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:deny-purchase`

</td>
<td>

Denies the purchase command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:allow-restore`

</td>
<td>

Enables the restore command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:deny-restore`

</td>
<td>

Denies the restore command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`iap:allow-registerListener`

</td>
<td>

Allows the webview to register event listeners for plugin-emitted events (entitlement-changed).

</td>
</tr>

<tr>
<td>

`iap:deny-registerListener`

</td>
<td>

Denies the webview from registering event listeners.

</td>
</tr>

<tr>
<td>

`iap:allow-removeListener`

</td>
<td>

Allows the webview to remove previously-registered event listeners.

</td>
</tr>

<tr>
<td>

`iap:deny-removeListener`

</td>
<td>

Denies the webview from removing event listeners.

</td>
</tr>
</table>
