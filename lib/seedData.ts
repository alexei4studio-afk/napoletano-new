/**
 * Script de populare bază de date — Meniu Special Napoletano
 * Sursa: Meniu_Special_Napoletano_Lav_3.DOC
 *
 * Rulare: importă și apelează seedMenuSpecial() o singură dată
 * dintr-o pagină temporară sau din consolă.
 * NU rula de două ori — nu are upsert, va dubla datele.
 */

import { supabase } from '@/lib/supabaseClient';

// ─── CATEGORII ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'mic_dejun',    label: 'Mic Dejun',          label_it: 'Prima Colazione', icon: '🍳', sort_order: 1  },
  { name: 'ciorbe',       label: 'Ciorbe & Supe',       label_it: 'Zuppe',           icon: '🍲', sort_order: 2  },
  { name: 'antipasti',    label: 'Antipasti',            label_it: 'Antipasti',       icon: '🫒', sort_order: 3  },
  { name: 'paste',        label: 'Paste',                label_it: 'Paste',           icon: '🍝', sort_order: 4  },
  { name: 'paste_cuptor', label: 'Paste la Cuptor',      label_it: 'Paste al Forno',  icon: '🫕', sort_order: 5  },
  { name: 'risotto',      label: 'Risotto',              label_it: 'Risotto',         icon: '🍚', sort_order: 6  },
  { name: 'principale',   label: 'Feluri Principale',    label_it: 'Secondi Piatti',  icon: '🥩', sort_order: 7  },
  { name: 'garnituri',    label: 'Garnituri',            label_it: 'Contorni',        icon: '🥔', sort_order: 8  },
  { name: 'salate',       label: 'Salate',               label_it: 'Insalate',        icon: '🥗', sort_order: 9  },
  { name: 'desert',       label: 'Deserturi',            label_it: 'Dolci',           icon: '🍮', sort_order: 10 },
  { name: 'bauturi',      label: 'Băuturi',              label_it: 'Bevande',         icon: '🥂', sort_order: 11 },
];

// ─── PRODUSE ──────────────────────────────────────────────────────────────────

const PRODUCTS: {
  category_id: string;
  name: string;
  description: string;
  price: number;
  weight: string | null;
  badge: string | null;
  sub_title: string | null;
  sort_order: number;
}[] = [

  // ── MIC DEJUN ────────────────────────────────────────────────────────────
  { category_id: 'mic_dejun', name: 'Ouă Ochiuri',          description: 'Ouă 2 buc, sare, piper',                                                                 price: 15, weight: null,     badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'mic_dejun', name: 'Omletă Șuncă Cascaval',description: 'Ou, șuncă, cascaval, sare, piper',                                                       price: 22, weight: null,     badge: null, sub_title: null, sort_order: 2 },
  { category_id: 'mic_dejun', name: 'Omletă Țărănească',    description: 'Ou, ciuperci, dovlecel, ardei gras, ceapă, brânză de vacă, bacon, sare, piper',           price: 23, weight: null,     badge: null, sub_title: null, sort_order: 3 },
  { category_id: 'mic_dejun', name: 'Omletă Vegetariană',   description: 'Ouă 3 buc, ciuperci, dovlecel, ardei gras, ceapă, vinete, sare, piper',                   price: 20, weight: null,     badge: null, sub_title: null, sort_order: 4 },

  // ── CIORBE & SUPE ─────────────────────────────────────────────────────────
  { category_id: 'ciorbe', name: 'Ciorbă de legume', description: 'Legume, verdeață, sare, piper',                   price: 25, weight: '350 ml', badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'ciorbe', name: 'Ciorbă de Pui',    description: 'Legume, pui 50gr, verdeată, sare, piper',         price: 27, weight: '350 ml', badge: null, sub_title: null, sort_order: 2 },
  { category_id: 'ciorbe', name: 'Ciorbă de Porc',   description: 'Legume, porc 50gr, verdeată, sare, piper',        price: 29, weight: '350 ml', badge: null, sub_title: null, sort_order: 3 },

  // ── ANTIPASTI ─────────────────────────────────────────────────────────────
  { category_id: 'antipasti', name: 'Caprese',                          description: 'Roșii proaspete, mozzarella, ulei de măsline, oregano',                             price: 30, weight: null, badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'antipasti', name: 'Caprese cu Prosciutto',            description: 'Roșii, mozzarella, prosciutto italian, ulei de măsline',                           price: 38, weight: null, badge: null, sub_title: null, sort_order: 2 },
  { category_id: 'antipasti', name: 'Antipasto Italiano (2 persoane)',  description: 'Prosciutto, salam Milano, salam Napoli, mozzarella, roșii cherry, măsline, focaccia', price: 55, weight: null, badge: null, sub_title: null, sort_order: 3 },
  { category_id: 'antipasti', name: 'Burrata cu roșii cherry și rucola',description: 'Burrata cremoasă, roșii cherry, rucola, ulei de măsline',                          price: 45, weight: null, badge: null, sub_title: null, sort_order: 4 },

  // ── PASTE ─────────────────────────────────────────────────────────────────
  { category_id: 'paste', name: 'Spaghetti Carbonara',             description: 'Spaghetti, bacon, ou, parmezan, piper',                                               price: 49, weight: null,     badge: null,       sub_title: null, sort_order: 1 },
  { category_id: 'paste', name: 'Penne Arrabbiata',                description: 'Penne, sos de roșii, usturoi, ardei iute, busuioc',                                   price: 40, weight: null,     badge: null,       sub_title: null, sort_order: 2 },
  { category_id: 'paste', name: 'Penne Quattro Formaggi',          description: 'Penne, gorgonzola, mozzarella, parmesan',                                              price: 0,  weight: '250gr',  badge: null,       sub_title: null, sort_order: 3 },
  { category_id: 'paste', name: 'Spaghetti Frutti di Mare',        description: 'Spaghetti, scoici, calamari, creveți, roșii cherry, usturoi',                          price: 65, weight: '250gr',  badge: 'popular',  sub_title: null, sort_order: 4 },
  { category_id: 'paste', name: 'Spaghetti Aglio Olio e Gamberi',  description: 'Spaghetti, creveți, usturoi, ulei de măsline, ardei iute',                             price: 69, weight: '250gr',  badge: null,       sub_title: null, sort_order: 5 },
  { category_id: 'paste', name: 'Spaghetti Aglio Olio e Peperoncino', description: 'Spaghetti, usturoi, ulei de măsline, ardei iute, pătrunjel',                       price: 0,  weight: '250gr',  badge: null,       sub_title: null, sort_order: 6 },
  { category_id: 'paste', name: 'Penne Napoletano',                description: 'Penne, creveți, somon afumat, spanac, smântână lichidă, parmigiano, usturoi, sare, piper', price: 0, weight: '300gr', badge: null,     sub_title: null, sort_order: 7 },

  // ── PASTE AL FORNO ────────────────────────────────────────────────────────
  { category_id: 'paste_cuptor', name: 'Penne Pollo e Funghi', description: 'Penne, pui, ciuperci, mozzarella, parmesan',               price: 50, weight: '300gr', badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'paste_cuptor', name: 'Penne Siciliana',      description: 'Penne, bacon, ciuperci, sos de roșii, mozzarella',          price: 0,  weight: '300gr', badge: null, sub_title: null, sort_order: 2 },

  // ── RISOTTO ───────────────────────────────────────────────────────────────
  { category_id: 'risotto', name: 'Risotto Quattro Formaggi', description: 'Orez arborio, gorgonzola, mozzarella, parmesan',  price: 0, weight: null, badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'risotto', name: 'Risotto cu Creveți',       description: 'Orez arborio, creveți, unt, parmesan',            price: 0, weight: null, badge: null, sub_title: null, sort_order: 2 },

  // ── FELURI PRINCIPALE — PUI ───────────────────────────────────────────────
  { category_id: 'principale', name: 'Șnițel Pui alla Parmigiana', description: 'Piept de pui pane, sos de roșii, mozzarella, parmezan',         price: 0,  weight: '250gr', badge: null, sub_title: 'PUI', sort_order: 1 },
  { category_id: 'principale', name: 'Piept de pui la grătar',     description: 'Piept de pui',                                                  price: 0,  weight: '200gr', badge: null, sub_title: 'PUI', sort_order: 2 },
  { category_id: 'principale', name: 'Tigaie Picantă Pui',         description: 'Carne, ceapă, ciuperci, ardei gras, pepperoncino',               price: 0,  weight: '250gr', badge: 'hot', sub_title: 'PUI', sort_order: 3 },
  { category_id: 'principale', name: 'Crispy de Pui',              description: 'Carne, fulgi de porumb, ou, sosul casei',                        price: 25, weight: '200gr', badge: 'popular', sub_title: 'PUI', sort_order: 4 },

  // ── FELURI PRINCIPALE — PORC ──────────────────────────────────────────────
  { category_id: 'principale', name: 'Ceafă de Porc la grătar',       description: 'Ceafă de porc',    price: 0, weight: '200gr', badge: null, sub_title: 'PORC', sort_order: 5 },
  { category_id: 'principale', name: 'Șnițel Porc alla Parmegiana',   description: '',                  price: 0, weight: null,   badge: null, sub_title: 'PORC', sort_order: 6 },

  // ── FELURI PRINCIPALE — VITĂ ──────────────────────────────────────────────
  { category_id: 'principale', name: 'Antricot de Vită la grătar',  description: 'Antricot de vită',  price: 135, weight: '350gr', badge: 'top',  sub_title: 'VITĂ', sort_order: 7 },
  { category_id: 'principale', name: 'Șnițel Vită alla Parmegiana', description: '',                   price: 0,   weight: null,   badge: null,   sub_title: 'VITĂ', sort_order: 8 },

  // ── FELURI PRINCIPALE — PEȘTE ─────────────────────────────────────────────
  { category_id: 'principale', name: 'Medalion de Somon la grătar',  description: 'Medalion somon, cartofi natur, condimente',     price: 0,  weight: '300gr', badge: null, sub_title: 'PEȘTE', sort_order: 9  },
  { category_id: 'principale', name: 'Doradă Imperială la grătar',   description: 'Doradă 450-500gr, cartofi natur, condimente',   price: 75, weight: '150gr', badge: null, sub_title: 'PEȘTE', sort_order: 10 },

  // ── GARNITURI ─────────────────────────────────────────────────────────────
  { category_id: 'garnituri', name: 'Cartofi prăjiți',   description: 'Cartofi, condimente', price: 0, weight: '150gr', badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'garnituri', name: 'Cartofi la cuptor', description: '',                    price: 0, weight: null,    badge: null, sub_title: null, sort_order: 2 },
  { category_id: 'garnituri', name: 'Piure de cartofi',  description: 'Cartofi, unt',        price: 0, weight: '150gr', badge: null, sub_title: null, sort_order: 3 },

  // ── SALATE ────────────────────────────────────────────────────────────────
  { category_id: 'salate', name: 'Salată de roșii',       description: 'Roșii, ulei de măsline, condimente',                                               price: 20, weight: '200gr', badge: null, sub_title: null, sort_order: 1 },
  { category_id: 'salate', name: 'Salată verde',          description: 'Salată verde, ulei de măsline, condimente',                                        price: 0,  weight: '200gr', badge: null, sub_title: null, sort_order: 2 },
  { category_id: 'salate', name: 'Salată mixtă',         description: 'Roșii, castraveți, salată mixtă, ardei gras, ulei de măsline, condimente',          price: 0,  weight: '300gr', badge: null, sub_title: null, sort_order: 3 },
  { category_id: 'salate', name: 'Salată Bulgărească / Grecească', description: 'Mix de salată, roșii, castraveți, brânză, șuncă, ou, ulei de măsline',    price: 0,  weight: '400gr', badge: null, sub_title: null, sort_order: 4 },
  { category_id: 'salate', name: 'Caesar',               description: 'Salată iceberg, piept de pui, crutoane, parmesan, dressing',                         price: 0,  weight: '350gr', badge: 'popular', sub_title: null, sort_order: 5 },
  { category_id: 'salate', name: 'Salată cu Ton',        description: 'Roșii cherry, salată mixtă, ardei gras, rucola, ceapă, ulei de măsline, condimente', price: 0,  weight: '300gr', badge: null, sub_title: null, sort_order: 6 },
  { category_id: 'salate', name: 'Salată Napoletano',    description: 'Salată mixtă, roșii, grepfrut, mango, somon fresh/ton fresh, lămâie, ulei de măsline', price: 0, weight: '350gr', badge: 'top', sub_title: null, sort_order: 7 },

  // ── DESERTURI ─────────────────────────────────────────────────────────────
  { category_id: 'desert', name: 'Tiramisu',                    description: 'Mascarpone, pișcoturi, ouă, zahăr, cafea espresso, amaretto, cacao pudră',              price: 0,  weight: '150gr', badge: 'popular', sub_title: null, sort_order: 1 },
  { category_id: 'desert', name: 'Clătite',                     description: 'Făină, lapte, ouă, zahăr, ulei, sare',                                                  price: 0,  weight: '150gr', badge: null, sub_title: null, sort_order: 2 },
  { category_id: 'desert', name: 'Papanași cu Nutella/Dulceață',description: 'Făină, brânză de vaci, ouă, zahăr, smântână, nutella/dulceță, ulei, sare',              price: 35, weight: '200gr', badge: null, sub_title: null, sort_order: 3 },

  // ── BĂUTURI — CAFEA ───────────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Ristretto',         description: '', price: 15, weight: '20 ml',  badge: null, sub_title: 'CAFEA', sort_order: 1 },
  { category_id: 'bauturi', name: 'Espresso',          description: '', price: 0,  weight: '40 ml',  badge: null, sub_title: 'CAFEA', sort_order: 2 },
  { category_id: 'bauturi', name: 'Espresso Lung',     description: '', price: 0,  weight: '80 ml',  badge: null, sub_title: 'CAFEA', sort_order: 3 },
  { category_id: 'bauturi', name: 'Caffè Latte',       description: '', price: 19, weight: '180 ml', badge: null, sub_title: 'CAFEA', sort_order: 4 },
  { category_id: 'bauturi', name: 'Cappuccino',        description: '', price: 0,  weight: '180 ml', badge: null, sub_title: 'CAFEA', sort_order: 5 },
  { category_id: 'bauturi', name: 'Caffè Macchiato',   description: '', price: 0,  weight: '60 ml',  badge: null, sub_title: 'CAFEA', sort_order: 6 },
  { category_id: 'bauturi', name: 'Iris Coffee',       description: '', price: 0,  weight: '200 ml', badge: null, sub_title: 'CAFEA', sort_order: 7 },
  { category_id: 'bauturi', name: 'Ceai',              description: 'Diverse sortimente', price: 0, weight: '200 ml', badge: null, sub_title: 'CAFEA', sort_order: 8 },

  // ── BĂUTURI — LIMONADE ────────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Limonadă Lămâie',                    description: '', price: 0, weight: '400 ml',  badge: null, sub_title: 'LIMONADE', sort_order: 9  },
  { category_id: 'bauturi', name: 'Limonadă Lămâie și Mentă',           description: '', price: 0, weight: '400 ml',  badge: null, sub_title: 'LIMONADE', sort_order: 10 },
  { category_id: 'bauturi', name: 'Limonadă Lămâie, Mentă și Busuioc',  description: '', price: 0, weight: '400 ml',  badge: null, sub_title: 'LIMONADE', sort_order: 11 },
  { category_id: 'bauturi', name: 'Limonadă Carafă',                    description: '', price: 0, weight: '1000 ml', badge: null, sub_title: 'LIMONADE', sort_order: 12 },

  // ── BĂUTURI — APĂ CARBOGAZOASĂ ────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Dorna Carbogazoasă',  description: '', price: 10, weight: '500 ml',  badge: null, sub_title: 'APĂ CARBOGAZOASĂ', sort_order: 13 },
  { category_id: 'bauturi', name: 'Tușnad 500ml',        description: '', price: 0,  weight: '500 ml',  badge: null, sub_title: 'APĂ CARBOGAZOASĂ', sort_order: 14 },
  { category_id: 'bauturi', name: 'Borsec',              description: '', price: 0,  weight: '750 ml',  badge: null, sub_title: 'APĂ CARBOGAZOASĂ', sort_order: 15 },
  { category_id: 'bauturi', name: 'Dorna 750ml',         description: '', price: 0,  weight: '750 ml',  badge: null, sub_title: 'APĂ CARBOGAZOASĂ', sort_order: 16 },
  { category_id: 'bauturi', name: 'Tușnad 1000ml',       description: '', price: 0,  weight: '1000 ml', badge: null, sub_title: 'APĂ CARBOGAZOASĂ', sort_order: 17 },

  // ── BĂUTURI — APĂ PLATĂ ───────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Artensia', description: '', price: 0, weight: '500 ml', badge: null, sub_title: 'APĂ PLATĂ', sort_order: 18 },

  // ── BĂUTURI — RĂCORITOARE ─────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Coca Cola',              description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 19 },
  { category_id: 'bauturi', name: 'Coca Cola Zero Zahăr',   description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 20 },
  { category_id: 'bauturi', name: 'Fanta',                  description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 21 },
  { category_id: 'bauturi', name: 'Sprite',                 description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 22 },
  { category_id: 'bauturi', name: 'Schweppes Bitter Lemon', description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 23 },
  { category_id: 'bauturi', name: 'Capy Portocale',         description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 24 },
  { category_id: 'bauturi', name: 'Capy Piersici',          description: '', price: 0, weight: '250 ml', badge: null, sub_title: 'RĂCORITOARE', sort_order: 25 },

  // ── BĂUTURI — BERE LA STICLĂ ──────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Peroni Nastro Azzurro',  description: '5.1%', price: 0,  weight: '330 ml', badge: null, sub_title: 'BERE', sort_order: 26 },
  { category_id: 'bauturi', name: 'Peroni Stile Capri',     description: '4.2%', price: 0,  weight: '330 ml', badge: null, sub_title: 'BERE', sort_order: 27 },
  { category_id: 'bauturi', name: 'Azugă Nepasteurizată',   description: '5.5%', price: 22, weight: '500 ml', badge: null, sub_title: 'BERE', sort_order: 28 },
  { category_id: 'bauturi', name: 'Azugă Nefiltratã',       description: '5.5%', price: 0,  weight: '500 ml', badge: null, sub_title: 'BERE', sort_order: 29 },
  { category_id: 'bauturi', name: 'Ursus Premium',          description: '5.0%', price: 0,  weight: '330 ml', badge: null, sub_title: 'BERE', sort_order: 30 },
  { category_id: 'bauturi', name: 'Ursus Nefiltrat',        description: '5.1%', price: 0,  weight: '330 ml', badge: null, sub_title: 'BERE', sort_order: 31 },
  { category_id: 'bauturi', name: 'Kozel Black',            description: '5.5%', price: 0,  weight: '500 ml', badge: null, sub_title: 'BERE', sort_order: 32 },
  { category_id: 'bauturi', name: 'Peroni Non Alcool',      description: '0.0%', price: 0,  weight: '330 ml', badge: null, sub_title: 'BERE FĂRĂ ALCOOL', sort_order: 33 },
  { category_id: 'bauturi', name: 'Ursus Non Alcool',       description: '0.0%', price: 0,  weight: '330 ml', badge: null, sub_title: 'BERE FĂRĂ ALCOOL', sort_order: 34 },

  // ── BĂUTURI — APERITIV & PROSECCO ────────────────────────────────────────
  { category_id: 'bauturi', name: 'Aperol',                             description: '', price: 0,   weight: '40 ml',  badge: null, sub_title: 'APERITIV', sort_order: 35 },
  { category_id: 'bauturi', name: 'Campari',                            description: '', price: 0,   weight: '40 ml',  badge: null, sub_title: 'APERITIV', sort_order: 36 },
  { category_id: 'bauturi', name: 'Limoncello',                         description: '', price: 0,   weight: null,     badge: null, sub_title: 'APERITIV', sort_order: 37 },
  { category_id: 'bauturi', name: 'Prosecco Cavatina Gold',             description: '', price: 0,   weight: '150 ml', badge: null, sub_title: 'PROSECCO', sort_order: 38 },
  { category_id: 'bauturi', name: 'Prosecco Mionetto DOC Trevisio',     description: '', price: 33,  weight: '150 ml', badge: null, sub_title: 'PROSECCO', sort_order: 39 },
  { category_id: 'bauturi', name: 'Prosecco Monteliana Asolo',          description: '', price: 0,   weight: '150 ml', badge: null, sub_title: 'PROSECCO', sort_order: 40 },
  { category_id: 'bauturi', name: 'Prosecco Cavatina Gold 750ml',       description: '', price: 120, weight: '750 ml', badge: null, sub_title: 'PROSECCO', sort_order: 41 },
  { category_id: 'bauturi', name: 'Prosecco Mionetto DOC Trevisio 750ml',description:'', price: 0,   weight: '750 ml', badge: null, sub_title: 'PROSECCO', sort_order: 42 },
  { category_id: 'bauturi', name: 'Prosecco Monteliana Asolo 750ml',    description: '', price: 145, weight: '750 ml', badge: null, sub_title: 'PROSECCO', sort_order: 43 },

  // ── BĂUTURI — VIN ────────────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Domeniile Braga',           description: '', price: 85,  weight: '750 ml', badge: null, sub_title: 'VIN ALB',  sort_order: 44 },
  { category_id: 'bauturi', name: 'Aerosoli',                  description: '', price: 110, weight: '750 ml', badge: null, sub_title: 'VIN ALB',  sort_order: 45 },
  { category_id: 'bauturi', name: 'Caii de la Letea Vol 1',    description: '', price: 0,   weight: '750 ml', badge: null, sub_title: 'VIN ALB',  sort_order: 46 },
  { category_id: 'bauturi', name: 'Tohani Fetească Regală',    description: '', price: 100, weight: '750 ml', badge: null, sub_title: 'VIN ALB',  sort_order: 47 },
  { category_id: 'bauturi', name: 'Pinot Grigio Valdadige',    description: '', price: 0,   weight: '750 ml', badge: null, sub_title: 'VIN ALB',  sort_order: 48 },
  { category_id: 'bauturi', name: 'Recaș Solle Sauvignon',     description: '', price: 200, weight: '750 ml', badge: null, sub_title: 'VIN ALB',  sort_order: 49 },
  { category_id: 'bauturi', name: 'Moșia Tohani Rosé',         description: '', price: 0,   weight: '750 ml', badge: null, sub_title: 'VIN ROSÉ', sort_order: 50 },
  { category_id: 'bauturi', name: 'Moșia Tohani Roșu',         description: '', price: 0,   weight: '750 ml', badge: null, sub_title: 'VIN ROȘU', sort_order: 51 },
  { category_id: 'bauturi', name: 'Primitivo Masso Antico',    description: '', price: 0,   weight: '750 ml', badge: null, sub_title: 'VIN ROȘU', sort_order: 52 },

  // ── BĂUTURI — SPIRTOASE ───────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Johnnie Walker',                description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'WHISKY',  sort_order: 53 },
  { category_id: 'bauturi', name: "Ballantine's",                  description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'WHISKY',  sort_order: 54 },
  { category_id: 'bauturi', name: "Jack Daniel's",                 description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'WHISKY',  sort_order: 55 },
  { category_id: 'bauturi', name: 'Jameson Black Barrel',          description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'WHISKY',  sort_order: 56 },
  { category_id: 'bauturi', name: 'Metaxa 7*',                     description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'COGNAC',  sort_order: 57 },
  { category_id: 'bauturi', name: 'Hennessy',                      description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'COGNAC',  sort_order: 58 },
  { category_id: 'bauturi', name: 'Tanqueray Dry Gin',             description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'GIN',     sort_order: 59 },
  { category_id: 'bauturi', name: 'Xibal',                         description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'TEQUILA', sort_order: 60 },
  { category_id: 'bauturi', name: 'Xiba Equinox',                  description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'TEQUILA', sort_order: 61 },
  { category_id: 'bauturi', name: 'Don Julio Reposado',            description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'TEQUILA', sort_order: 62 },
  { category_id: 'bauturi', name: 'Plantation Pineapple',          description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'ROM',     sort_order: 63 },
  { category_id: 'bauturi', name: 'Bumbu',                         description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'ROM',     sort_order: 64 },
  { category_id: 'bauturi', name: 'Diplomatico Seleccion de Familia', description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'ROM', sort_order: 65 },
  { category_id: 'bauturi', name: 'Botran Ki',                     description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'ROM',     sort_order: 66 },
  { category_id: 'bauturi', name: 'Absolut',                       description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'VODKA',   sort_order: 67 },
  { category_id: 'bauturi', name: 'Beluga Noble',                  description: '', price: 0, weight: '40 ml', badge: null, sub_title: 'VODKA',   sort_order: 68 },

  // ── BĂUTURI — COCKTAIL ────────────────────────────────────────────────────
  { category_id: 'bauturi', name: 'Aperol Spritz',   description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 69 },
  { category_id: 'bauturi', name: 'Hugo',            description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 70 },
  { category_id: 'bauturi', name: 'Margarita',       description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 71 },
  { category_id: 'bauturi', name: 'Mojito Mint',     description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 72 },
  { category_id: 'bauturi', name: 'Cosmopolitan',    description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 73 },
  { category_id: 'bauturi', name: 'Gin Tonic',       description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 74 },
  { category_id: 'bauturi', name: 'Campari Orange',  description: '', price: 0, weight: null, badge: null, sub_title: 'COCKTAIL', sort_order: 75 },
];

// ─── FUNCȚII SEED ─────────────────────────────────────────────────────────────

async function seedCategories() {
  console.log(`[SEED] Inserez ${CATEGORIES.length} categorii...`);
  const { data, error } = await supabase.from('categories').insert(CATEGORIES).select();
  if (error) {
    console.error('[SEED] EROARE categorii:', error.message);
    return false;
  }
  console.log(`[SEED] ✓ ${data?.length} categorii inserate.`);
  return true;
}

async function seedProducts() {
  console.log(`[SEED] Inserez ${PRODUCTS.length} produse...`);
  // Inserăm în batch-uri de 50 pentru a evita timeout
  const BATCH = 50;
  let total = 0;
  for (let i = 0; i < PRODUCTS.length; i += BATCH) {
    const batch = PRODUCTS.slice(i, i + BATCH);
    const { data, error } = await supabase.from('products').insert(batch).select();
    if (error) {
      console.error(`[SEED] EROARE produse (batch ${i}–${i + BATCH}):`, error.message);
      return false;
    }
    total += data?.length ?? 0;
    console.log(`[SEED]   batch ${i + 1}–${Math.min(i + BATCH, PRODUCTS.length)} OK`);
  }
  console.log(`[SEED] ✓ ${total} produse inserate.`);
  return true;
}

/**
 * Apelează această funcție o singură dată din interfața admin sau din consolă.
 * Exemplu de utilizare într-o pagină temporară:
 *
 *   import { seedMenuSpecial } from '@/lib/seedData';
 *   await seedMenuSpecial();
 */
export async function seedMenuSpecial() {
  console.log('[SEED] ══════ START SEED Meniu Special Napoletano ══════');
  const catOk = await seedCategories();
  if (!catOk) {
    console.error('[SEED] Abandonez — eroare la categorii.');
    return;
  }
  const prodOk = await seedProducts();
  if (!prodOk) {
    console.error('[SEED] Eroare la produse. Categoriile au fost inserate.');
    return;
  }
  console.log('[SEED] ══════ SEED FINALIZAT CU SUCCES ══════');
  console.log(`[SEED] Total: ${CATEGORIES.length} categorii + ${PRODUCTS.length} produse`);
}
