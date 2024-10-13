

const products = [
  {
    description: '1Epic battle game with stunning graphics',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
    price: 24,
    title: 'Battle Royale X',
    count: 10,
  },
  {
    description: '1Experience the thrill of racing in exotic locations',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a1',
    price: 15,
    title: 'Speed Racer',
    count: 5,
  },
  {
    description: '1Explore a vast open world full of danger and opportunity',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a3',
    price: 23,
    title: 'Open World Adventure',
    count: 8,
  },
  {
    description: '1Competitive first-person shooter game with strategic play',
    id: '7567ec4b-b10c-48c5-9345-fc73348a80a1',
    price: 15,
    title: 'Strategic Shooter',
    count: 12,
  },
  {
    description: '1Survival game in a post-apocalyptic world',
    id: '7567ec4b-b10c-48c5-9445-fc73c48a80a2',
    price: 23,
    title: 'Apocalypse Survivor',
    count: 7,
  },
];


export default class ProductService {
  async getAllProducts() {
    return products;
  }

  async getProductById(productId: string) {
    return products.find(p => p.id === productId);;
  }
}
