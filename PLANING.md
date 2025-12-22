# Library Planing
## Routes
### API Auth Routes

- <b>POST</b> `/api/auth/login` <br>
- <b>POST</b> `/api/auth/register` <br>
- <b>GET</b> `/api/auth/logout` <br>
- <b>POST</b> `/api/auth/forgot-password` <br>
- <b>POST</b> `/api/auth/reset-password` <br>

* <b>GET</b> `/api/auth/me`
* <b>PUT</b> `/api/auth/me`
* <b>DELETE</b> `/api/auth/me`

### API Lending Routes

- <b>POST</b> `/api/lending/create`
- <b>POST</b> `/api/lending/return`
- <b>PUT</b> `/api/lending/extend`
- <b>DELETE</b> `/api/lending/delete`
- <b>GET</b> `/api/lending/list`
- <b>GET</b> `/api/lending/list/:number/:page`


### API Users Routes

- <b>GET</b> `/api/users/all/:number/:page`
- <b>PUT</b> `/api/users/update`
- <b>DELETE</b> `/api/users/delete`

### API Books Routes

- <b>GET</b> `/api/books/all/:number/:page`
- <b>GET</b> `/api/books/search/:category/:number/:page`
- <b>GET</b> `/api/books/all/:id`
- <b>POST</b> `/api/books/add`
- <b>PUT</b> `/api/books/update`
- <b>DELETE</b> `/api/books/delete`




