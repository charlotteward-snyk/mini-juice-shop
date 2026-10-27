const products = [
  { id: 1, name: 'Apple Juice (1000ml)', description: 'The all-time classic.', category: 'juice', price: 1.99, shippingDays: 2 },
  { id: 2, name: 'Orange Juice (1000ml)', description: 'Made from oranges hand-picked by Uncle Dittmeyer.', category: 'juice', price: 2.99, shippingDays: 2 },
  { id: 3, name: 'Eggfruit Juice (500ml)', description: 'Now with even more exotic flavour.', category: 'juice', price: 8.99, shippingDays: 4 },
  { id: 4, name: 'Juice Shop T-Shirt', description: 'Real fans wear it 24/7!', category: 'merch', price: 22.49, shippingDays: 5 },
  { id: 5, name: 'Juice Shop Hoodie', description: 'Stay warm while you hack.', category: 'merch', price: 49.9, shippingDays: 5 },
  { id: 6, name: 'Fruit Press', description: 'Fruit squeezing made easy.', category: 'gadget', price: 89.99, shippingDays: 7 }
]

const orders = [
  {
    id: 1,
    customer: 'jim@mini-juice.sh',
    items: [
      { sku: 'apple', name: 'Apple Juice (1000ml)', qty: 2, price: 1.99 },
      { sku: 'tshirt', name: 'Juice Shop T-Shirt', qty: 1, price: 22.49 }
    ]
  },
  {
    id: 2,
    customer: 'bender@mini-juice.sh',
    items: [{ sku: 'press', name: 'Fruit Press', qty: 1, price: 89.99 }]
  }
]

const users = [
  { id: 1, email: 'admin@mini-juice.sh', role: 'admin', password: 'admin123' },
  { id: 2, email: 'jim@mini-juice.sh', role: 'customer', password: 'ncc-1701' }
]

const profiles = {
  'admin@mini-juice.sh': { displayName: 'Admin', bio: '', settings: { theme: 'light', newsletter: false } },
  'jim@mini-juice.sh': { displayName: 'Jim', bio: '', settings: { theme: 'light', newsletter: true } }
}

const feedback = []

module.exports = { products, orders, users, profiles, feedback }
