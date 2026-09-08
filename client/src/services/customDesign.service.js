import api from './api';

export async function submitCustomDesignRequest({
  name,
  email,
  whatsapp,
  designType,
  projectDescription,
  dimensions,
  quantity,
  budget,
  deadline,
  referenceFile,
}) {
  const form = new FormData();
  form.append('name', name);
  form.append('email', email);
  form.append('whatsapp', whatsapp);
  form.append('designType', designType);
  form.append('projectDescription', projectDescription);
  if (dimensions) form.append('dimensions', dimensions);
  if (quantity) form.append('quantity', quantity);
  if (budget) form.append('budget', budget);
  if (deadline) form.append('deadline', deadline);
  if (referenceFile) form.append('referenceFile', referenceFile);

  const { data } = await api.post('/custom-design', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
