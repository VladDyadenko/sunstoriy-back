export const nameRegexp = /(([A-Za-z]+[,.]?[ ]?|[a-z]+['-]?)+)$/;

export const emailRegexp =
  /^[\w!#$%^&*\-=/{}[\]_|`~?\\+][\w!#$%^&*\+\-?=/{}[\]_|`~\\.]{1,62}[\w!#$%^&*\-=/{}+[\]_|`~?\\]@([\w]+\.){1,20}[\w]{1,4}$/;

export const passwordRegexp = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;
