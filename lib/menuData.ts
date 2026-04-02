export type MenuItem = {
  name: string
  nameIt?: string
  ingredients: string
  price: number
  weight?: string
  badge?: string
}

export type MenuCategory = {
  id: string
  label: string
  labelIt: string
  icon: string
  items: MenuItem[]
}

export const menuData: MenuCategory[] = [
  {
    id: 'pizza',
    label: 'Pizza Napoletano',
    labelIt: 'Pizza classica',
    icon: '🍕',
    items: [
      {
        name: 'Margherita',
        nameIt: 'La classica',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, parmezan, ulei EV, busuioc',
        price: 45,
        weight: '500g',
      },
      {
        name: 'Salami',
        nameIt: 'Con salame Napoli',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, salam Napoli, parmezan, ulei EV, busuioc',
        price: 47,
        weight: '600g',
      },
      {
        name: 'Prosciutto Cotto',
        nameIt: 'Con prosciutto',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, prosciutto cotto, parmezan, ulei EV, busuioc',
        price: 49,
        weight: '600g',
      },
      {
        name: 'Diavola',
        nameIt: 'La piccante',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, ventricina, parmezan, ulei EV, busuioc',
        price: 49,
        weight: '700g',
        badge: 'Picantă',
      },
      {
        name: 'Prosciutto e Funghi',
        nameIt: 'Classico italiano',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, prosciutto cotto, ciuperci, parmezan, ulei EV, busuioc',
        price: 49,
        weight: '600g',
      },
      {
        name: 'Quattro Stagioni',
        nameIt: 'Patru anotimpuri',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, prosciutto cotto, ciuperci, salam Napoli, măsline, parmezan, ulei EV, busuioc',
        price: 55,
        weight: '700g',
      },
      {
        name: 'Capricciosa',
        nameIt: 'La generosa',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, prosciutto cotto, ciuperci, măsline, parmezan, ulei EV, busuioc',
        price: 55,
        weight: '700g',
      },
      {
        name: 'Quattro Formaggi',
        nameIt: 'Quattro formaggi',
        ingredients: 'Aluat 280g, gran cucina, mozzarella, scarmoza, gorgonzola, parmezan, ulei EV, busuioc',
        price: 49,
        weight: '600g',
      },
      {
        name: 'Vegetariana',
        nameIt: 'Per gli amanti della natura',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, ciuperci, măsline, ardei, rucola, roșii uscate, parmezan, ulei EV, busuioc',
        price: 49,
        weight: '700g',
        badge: 'Veggie',
      },
      {
        name: 'Tonno e Cipolla',
        nameIt: 'Dal mare',
        ingredients: 'Aluat 280g, sos de roșii, ton, ceapă, mozzarella, parmezan, ulei EV, busuioc',
        price: 49,
        weight: '600g',
      },
    ],
  },
  {
    id: 'speciale',
    label: 'Pizza Speciale',
    labelIt: 'Le nostre specialità',
    icon: '⭐',
    items: [
      {
        name: 'Regina Margherita',
        nameIt: 'La regina',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, burratina 125g, roșii cherry, parmezan, ulei EV, busuioc',
        price: 59,
        weight: '700g',
        badge: 'Bestseller',
      },
      {
        name: 'Napoletano',
        nameIt: 'La nostra firma',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, rucola, crudo, bufala, roșii cherry, pesto, parmezan, aceto balsamic',
        price: 59,
        weight: '700g',
        badge: 'Signature',
      },
      {
        name: 'Italiana Napoletano',
        nameIt: 'L\'italiana',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, crudo, roșii cherry, bufala, rucola, parmezan, ulei EV, busuioc',
        price: 59,
        weight: '700g',
      },
      {
        name: 'Mortadella e Burrata',
        nameIt: 'La cremosa',
        ingredients: 'Aluat 280g, gran cucina, mozzarella, mortadella, burratina 125g, parmezan, pesto, fistic, busuioc',
        price: 59,
        weight: '700g',
      },
      {
        name: 'Napoletano cu Creveți',
        nameIt: 'Dal mare con stile',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, gamberi 100g, roșii cherry, caviar negru, parmezan, ulei EV, busuioc',
        price: 65,
        weight: '700g',
        badge: 'Premium',
      },
      {
        name: 'Crudo e Bufala',
        nameIt: 'La freschezza',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, crudo, roșii cherry, bufala, rucola, parmezan, ulei EV, busuioc',
        price: 65,
        weight: '700g',
      },
      {
        name: 'Margherita di Bufala',
        nameIt: 'La purezza',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, bufala 125g, ulei EV, parmezan, busuioc',
        price: 69,
        weight: '700g',
        badge: 'Top',
      },
      {
        name: 'Quattro Carni',
        nameIt: 'Per i carnivori',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, cotto, salam Napoli, ventricina, crudo, parmezan, ulei EV, busuioc',
        price: 55,
        weight: '600g',
      },
      {
        name: 'Salsiccia e Funghi',
        nameIt: 'Rustica',
        ingredients: 'Aluat 280g, sos de roșii, mozzarella, ciuperci, salsiccia, parmezan, ulei EV, busuioc',
        price: 59,
        weight: '650g',
      },
    ],
  },
  {
    id: 'antipasti',
    label: 'Antipasti',
    labelIt: 'Per cominciare',
    icon: '🫒',
    items: [
      {
        name: 'Crudo di Parma e Bufala',
        nameIt: 'L\'inizio perfect',
        ingredients: 'Focaccia 120g, mozzarella di bufala 120g, prosciutto crudo di Parma 80g',
        price: 40,
      },
      {
        name: 'Crudo di Parma e Burrata',
        nameIt: 'La cremosità',
        ingredients: 'Focaccia 120g, burrata 120g, prosciutto crudo di Parma 80g',
        price: 60,
      },
      {
        name: 'Platou Reale per 2',
        nameIt: 'Per due',
        ingredients: 'Selecție de mezeluri italiene, brânzeturi, focaccia, măsline, roșii uscate',
        price: 60,
        badge: 'Per 2',
      },
      {
        name: 'Vegetariana',
        nameIt: 'Dal orto',
        ingredients: 'Legume la grătar, focaccia, ulei EV, ierburi aromatice',
        price: 25,
        badge: 'Veggie',
      },
    ],
  },
  {
    id: 'paste',
    label: 'Paste',
    labelIt: 'Pasta fatta bene',
    icon: '🍝',
    items: [
      {
        name: 'Spaghetti Aglio e Olio',
        nameIt: 'Il classico di Napoli',
        ingredients: 'Spaghetti, usturoi, ulei EV, peperoncino, pătrunjel, parmezan',
        price: 38,
      },
      {
        name: 'Penne all\'Arrabbiata',
        nameIt: 'La piccante',
        ingredients: 'Penne, sos de roșii, usturoi, peperoncino, busuioc, parmezan',
        price: 38,
        badge: 'Picantă',
      },
      {
        name: 'Rigatoni alla Carbonara',
        nameIt: 'La romana',
        ingredients: 'Rigatoni, guanciale, gălbenuș de ou, pecorino romano, piper negru',
        price: 49,
        badge: 'Bestseller',
      },
      {
        name: 'Tagliatelle al Ragù',
        nameIt: 'La bolognese napoletana',
        ingredients: 'Tagliatelle proaspete, ragù de carne, vin roșu, rosii, parmezan, busuioc',
        price: 49,
      },
      {
        name: 'Linguine allo Scoglio',
        nameIt: 'Frutti di mare',
        ingredients: 'Linguine, creveți, calamari, midii, sos de roșii, usturoi, vin alb, pătrunjel',
        price: 65,
        badge: 'Premium',
      },
    ],
  },
  {
    id: 'desert',
    label: 'Desert',
    labelIt: 'Il dolce finale',
    icon: '🍮',
    items: [
      {
        name: 'Tiramisù Napoletano',
        nameIt: 'Il classico',
        ingredients: 'Mascarpone, savoiardi, espresso, cacao, gălbenuș de ou, amaretto',
        price: 29,
        badge: 'Clasic',
      },
      {
        name: 'Panna Cotta',
        nameIt: 'La dolcezza',
        ingredients: 'Frișcă, zahăr, vanilie de Bourbon, coulis de fructe de pădure',
        price: 25,
      },
      {
        name: 'Cannoli Siciliani',
        nameIt: 'Dalla Sicilia',
        ingredients: 'Coajă crocantă, ricotta, zahăr pudră, fistic, scorțișoară, ciocolată',
        price: 27,
      },
      {
        name: 'Gelato Artigianale',
        nameIt: 'Il fresco',
        ingredients: 'Înghețată artizanală — ciocolată, pistacchio, stracciatella, fragola (2 bile)',
        price: 22,
      },
    ],
  },
  {
    id: 'parteneri',
    label: 'PRODUSE PARTENERI',
    labelIt: 'Prodotti Partner',
    icon: '🤝',
    items: [
      {
        name: 'Ulei de Măsline Giglio d\'Oro',
        nameIt: 'Olio d\'Oliva Extra Vergine',
        ingredients: 'Ulei de măsline de calitate superioară, presat la rece, origine Italia',
        price: 45,
        weight: '500ml',
      },
      {
        name: 'Pomodori Pelati Ciao',
        nameIt: 'Pomodori Pelati',
        ingredients: 'Roșii decojite întregi în suc propriu, conserve premium pentru pizza',
        price: 65,
        weight: '2.5kg',
      },
      {
        name: 'Făină Caputo Nuvola',
        nameIt: 'Farina Caputo Nuvola',
        ingredients: 'Făină tip 0 ideală pentru marginea pufoasă (cornicione) specifică Napoli',
        price: 18,
        weight: '1kg',
      },
      {
        name: 'Pasta di Gragnano',
        nameIt: 'Pasta artigianale',
        ingredients: 'Paste artizanale din grâu dur, diverse sortimente (Spaghetti, Rigatoni)',
        price: 25,
        weight: '500g',
      },
      {
        name: 'Pesto di Pistacchio',
        nameIt: 'Crema di Pistacchio',
        ingredients: 'Pesto autentic de fistic pentru preparate gourmet sau deserturi',
        price: 45,
        weight: '190g',
      },
    ],
  },
  {
    id: 'panini',
    label: 'PANINI & PRODUSE PUI',
    labelIt: 'Panini e Pollo',
    icon: '🥪',
    items: [
      {
        name: 'Panino Napoletano (Pui)',
        nameIt: 'Panino con Pollo',
        ingredients: 'Ciabatta, piept de pui la grătar, mozzarella, salată verde, roșii, sos alb special',
        price: 30,
        weight: '450g',
      },
      {
        name: 'Panino Crudo di Parma',
        nameIt: 'Panino con Crudo',
        ingredients: 'Ciabatta, prosciutto crudo di Parma, mozzarella fior di latte, rucola, parmezan, ulei măsline',
        price: 35,
        weight: '400g',
      },
      {
        name: 'Panino Mortadella e Pistacchio',
        nameIt: 'Panino Gourmet',
        ingredients: 'Ciabatta, mortadella Bologna, mozzarella di bufala, pesto de fistic, fistic zdrobit',
        price: 38,
        weight: '420g',
      },
      {
        name: 'Crispy Chicken Plate',
        nameIt: 'Pollo fritto',
        ingredients: 'Fâșii de pui crocant (5 buc), cartofi prăjiți de casă, sos de usturoi inclus',
        price: 45,
        weight: '500g',
        badge: 'Bestseller',
      },
      {
        name: 'Hot Wings Plate',
        nameIt: 'Ali di pollo piccanti',
        ingredients: 'Aripioare de pui marinate și picante (6 buc), cartofi prăjiți, sos chilli',
        price: 42,
        weight: '500g',
        badge: 'Picantă',
      },
    ],
  },
]