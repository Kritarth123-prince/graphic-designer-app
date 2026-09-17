import api from '../services/api';

// Auth is sent as a Bearer header now, not a cookie, so a plain <a href>
// pointing at the API can't authenticate. Fetch the file through the api
// client (which attaches the header) and save it via a Blob URL instead.
export async function downloadFile(path, filename) {
  const response = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  // Allow-list to plain filename characters before it reaches the DOM,
  // since the server-supplied name is untrusted input.
  const safeName = typeof filename === 'string' ? filename.replace(/[^a-zA-Z0-9._ -]/g, '_') : '';
  link.download = safeName || 'download';
  // .click() works on a detached anchor in all current browsers, so
  // there's no need to insert it into the document at all.
  link.click();
  window.URL.revokeObjectURL(url);
}
