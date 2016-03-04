import parseJSON from './parseJSON';

export default function performQuery(endpoint, query, variables) {
  const opts = {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ query, variables }),
  };

  return fetch(endpoint, opts)
    .then(parseJSON);
}
