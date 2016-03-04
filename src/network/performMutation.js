import parseJSON from './parseJSON';

export default function performMutation(endpoint, mutation, variables, files) {
  if (!files) {
    return fetch(endpoint, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    }).then(parseJSON);
  }

  const formData = new FormData();
  formData.append('query', mutation);
  formData.append('variables', JSON.stringify(variables));
  if (files) {
    for (const filename in files) {
      if (files.hasOwnProperty(filename)) {
        formData.append(filename, files[filename]);
      }
    }
  }
  return fetch(endpoint, {
    method: 'post',
    credentials: 'same-origin',
    body: formData,
  }).then(parseJSON);
}
