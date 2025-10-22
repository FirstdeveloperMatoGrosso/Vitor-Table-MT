export const formatCPF = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
  if (!match) return value;
  const [, part1, part2, part3, part4] = match;
  if (part4) return `${part1}.${part2}.${part3}-${part4}`;
  if (part3) return `${part1}.${part2}.${part3}`;
  if (part2) return `${part1}.${part2}`;
  return part1;
};

export const formatPhone = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
  if (!match) return value;
  const [, part1, part2, part3] = match;
  if (part3) return `(${part1}) ${part2}-${part3}`;
  if (part2) return `(${part1}) ${part2}`;
  return part1;
};
