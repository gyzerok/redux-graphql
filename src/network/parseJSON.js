export default function parseJSON(res) {
  if (res.status !== 200) {
    throw 'Invalid request.'
  }

  return res.json().then(json => json.data);
}
