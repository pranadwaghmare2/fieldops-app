/**
 * HTTP status codes the app branches on — no magic numbers in mappers.
 */
export enum HttpStatus {
  Conflict = 409,
  UnprocessableEntity = 422,
  InternalServerError = 500,
}
