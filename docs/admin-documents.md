# Resit & Quotation

Admin opens **Administration → Resit & Quotation** to create a document manually or fill customer/items from an existing order. Catalog products and custom service lines are supported. Enter discounts, delivery charges and, for receipts, the payment actually received. Imported orders do not automatically count as paid. Saving creates an independent snapshot; it does not change order status, inventory, sales totals or existing custom-print requests.

Saved documents can be reopened from history and printed using **Cetak / Simpan PDF** (choose Save as PDF in the browser print dialog). New documents receive unique `RCT` / `QUO` numbers. Saved records are read-only in the UI. The old customer order invoice remains unchanged.

## Firebase setup required before live use

Records use the new `adminDocuments` collection. The repository does not contain the deployed Firestore rules or deployment credentials. Merge the following match block **inside the existing** `/databases/{database}/documents` block in Firebase Console → Firestore → Rules. Preserve all existing collection rules. Ensure no broader wildcard rule grants non-admin access to this collection: Firestore allows access if ANY matching rule permits it.

```text
match /adminDocuments/{documentId} {
  function documentAdmin() {
    return request.auth != null
      && request.auth.token.email_verified == true
      && request.auth.token.email == 'juscinta89@gmail.com';
  }
  allow read: if documentAdmin();
  allow create: if documentAdmin()
    && request.resource.data.createdBy == request.auth.uid
    && request.resource.data.type in ['receipt', 'quotation'];
  // Permit an identical retry after an interrupted acknowledgement.
  allow update: if documentAdmin()
    && request.resource.data == resource.data;
  allow delete: if false;
}
```

Verify in the rules simulator that signed-out users and customers cannot read or write documents, and the verified admin can create/read. Live Firebase persistence and authenticated UI must be checked with the admin account after applying these rules; this implementation does not deploy Firebase rules.

## Validation

- `npm run build`
- `node --test tests/documentMath.test.js`
- Admin check: save a quotation, reload history, reopen, print; repeat for a partial-payment receipt; verify a customer cannot access document records.
