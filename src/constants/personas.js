export const PERSONAS = [
  {
    id: 'developer',
    name: 'Developer',
    color: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-500'
  },
  {
    id: 'merchandiser',
    name: 'Merchandiser', 
    color: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-500'
  },
  {
    id: 'ecommerce-leader',
    name: 'Ecommerce Leader',
    color: 'bg-purple-500',
    textColor: 'text-white',
    borderColor: 'border-purple-500'
  }
];

export const getPersonaById = (id) => {
  return PERSONAS.find(persona => persona.id === id) || PERSONAS[0];
}; 