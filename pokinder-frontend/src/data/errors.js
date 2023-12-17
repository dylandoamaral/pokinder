export const convertResponseToMessage = (response) => {
  switch (response.status) {
    case 401:
      switch (response.data.detail) {
        case "INVALID_TOKEN":
          return "The session is invalid, reconnect";
        case "EXPIRED_TOKEN":
          return "The session is expired, reconnect";
        default:
          return "An unexpected error happened";
      }
    case 404:
      return "The resource is not found";
    case 409:
      switch (response.data.detail) {
        case "USERNAME_EXISTS":
          return "The username already exists";
        case "EMAIL_EXISTS":
          return "The email already exists";
        case "ACCOUNT_ID_EXISTS":
          return "The account ID already exists";
        default:
          return "An unexpected error happened";
      }
    default:
      return "An unexpected error happened";
  }
};
