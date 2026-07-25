const query = new URLSearchParams(location.search);
const source = new Image();
source.onload = () => {
  const x = Number(query.get('x'));
  const y = Number(query.get('y'));
  const width = Number(query.get('width'));
  const height = Number(query.get('height'));
  const scale = source.naturalWidth / innerWidth;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(source, x * scale, y * scale, width * scale, height * scale, 0, 0, canvas.width, canvas.height);
  document.querySelector('#capture').src = canvas.toDataURL('image/png');
};
source.src = query.get('image');
