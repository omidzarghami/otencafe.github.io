export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export const menuSections: MenuSection[] = [
  {
    id: "espresso",
    title: "بر پایه ی اسپرسو",
    items: [
      {
        id: "espresso-single",
        name: "اسپرسو سینگل",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا",
        price: 90,
        image: "/assets/images/espresso.webp",
      },
      {
        id: "espresso-double",
        name: "اسپرسو دبل",
        description: "اسپرسو دَبِل 70% عربیکا 30% روبوستا",
        price: 100,
        image: "/assets/images/espresso.webp",
      },
      {
        id: "americano",
        name: "آمریکانو",
        description: "اسپرسو دَبِل 70% عربیکا 30% روبوستا + آب",
        price: 100,
        image: "/assets/images/americano.webp",
      },
      {
        id: "cappuccino",
        name: "کاپوچینو",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر",
        price: 115,
        image: "/assets/images/cappuccino.webp",
      },
      {
        id: "latte",
        name: "لاته",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر",
        price: 130,
        image: "/assets/images/latte.webp",
      },
      {
        id: "latte-cinnamon",
        name: "لاته دارچین",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+ سیروپ دارچین",
        price: 140,
        image: "/assets/images/latte.webp",
      },
      {
        id: "latte-hazelnut",
        name: "لاته فندق",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+ سیروپ فندق",
        price: 140,
        image: "/assets/images/latte.webp",
      },
      {
        id: "latte-caramel",
        name: "لاته کارامل",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+ سیروپ کارامل",
        price: 140,
        image: "/assets/images/latte.webp",
      },
      {
        id: "latte-special",
        name: "لاته مخصوص اوتن",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+ سیروپ توت فرنگی و انبه",
        price: 150,
        image: "/assets/images/latte.webp",
      },
      {
        id: "macchiato",
        name: "ماکیاتو",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ فوم شیر",
        price: 140,
        image: "/assets/images/latte.webp",
      },
      {
        id: "caramel-macchiato",
        name: "کارامل ماکیاتو",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ فوم شیر+ سیروپ کارامل",
        price: 140,
        image: "/assets/images/caramel macchiato.webp",
      },
      {
        id: "latte-vanilla",
        name: "لاته وانیل",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+سیروپ وانیل",
        price: 140,
        image: "/assets/images/latte.webp",
      },
      {
        id: "latte-chocolate",
        name: "لاته شکلات",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+سیروپ شکلات",
        price: 140,
        image: "/assets/images/latte.webp",
      },
      {
        id: "mocha",
        name: "موکا",
        description: "اسپرسو تک شات 70% عربیکا 30% روبوستا+ شیر+ سیروپ شکلات",
        price: 140,
        image: "/assets/images/mocha.webp",
      },
      {
        id: "flat-white",
        name: "فلت وایت",
        description: "اسپرسو دَبِل شات 70% عربیکا 30% روبوستا+ شیر",
        price: 140,
        image: "/assets/images/latte.webp",
      },
    ],
  },
  {
    id: "food",
    title: "پیش غذا و میان وعده",
    items: [
      {
        id: "chips-cheese",
        name: "چیپس و پنیر",
        description: "",
        price: 250,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "chips-cheese-special",
        name: "چیپس و پنیر ویژه",
        description: "",
        price: 320,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "fries-cheese",
        name: "سیب زمینی با پنیر",
        description: "",
        price: 280,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "fries",
        name: "سیب زمینی سرخ شده",
        description: "",
        price: 220,
        image: "/assets/images/mian/fries.webp",
      },
      {
        id: "fries-mushroom",
        name: "سیب زمینی با سس قارچ",
        description: "",
        price: 330,
        image: "/assets/images/mian/mushroom sauce fries.webp",
      },
      {
        id: "fries-special",
        name: "سیب زمینی ویژه",
        description: "",
        price: 360,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "classic-burger",
        name: "برگر کلاسیک",
        description: "",
        price: 430,
        image: "/assets/images/burgers/classic burger.webp",
      },
      {
        id: "cheese-burger",
        name: "چیز برگر",
        description: "",
        price: 450,
        image: "/assets/images/burgers/cheese burger.webp",
      },
      {
        id: "mushroom-burger",
        name: "ماشروم برگر",
        description: "",
        price: 480,
        image: "/assets/images/burgers/mushroom burger.webp",
      },
    ],
  },
  {
    id: "shakes",
    title: "شیک و بستنی",
    items: [
      {
        id: "shake-chocolate-banana",
        name: "شیک موز شکلات",
        description: "",
        price: 200,
        image: "/assets/images/shakes/chocolate shake.webp",
      },
      {
        id: "shake-chocolate",
        name: "شیک شکلات",
        description: "",
        price: 110,
        image: "/assets/images/shakes/chocolate shake.webp",
      },
      {
        id: "shake-peanut",
        name: "شیک بادام زمینی",
        description: "",
        price: 200,
        image: "/assets/images/shakes/peanut shake.webp",
      },
      {
        id: "shake-caramel",
        name: "شیک کارامل",
        description: "",
        price: 200,
        image: "/assets/images/shakes/caramel shake.webp",
      },
      {
        id: "shake-nutella",
        name: "شیک نوتلا",
        description: "",
        price: 220,
        image: "/assets/images/shakes/chocolate shake.webp",
      },
    ],
  },
  {
    id: "tea",
    title: "چای و دمنوش",
    items: [
      {
        id: "tea-simple",
        name: "چای ساده",
        description: "",
        price: 80,
        image: "/assets/images/cup-of-tea.jpg",
      },
      {
        id: "tea-lemon-honey",
        name: "چای لیمو عسل",
        description: "",
        price: 110,
        image: "/assets/images/cup-of-tea.jpg",
      },
      {
        id: "tea-avishan",
        name: "چای آویشن",
        description: "",
        price: 110,
        image: "/assets/images/cup-of-tea.jpg",
      },
      {
        id: "herbal-fruit-garden",
        name: "دمنوش باغ میوه",
        description: "",
        price: 125,
        image: "/assets/images/cup-of-tea.jpg",
      },
      {
        id: "herbal-energetic",
        name: "دمنوش نشاط آور",
        description: "بهار نارنج، لیمو و پنیرک",
        price: 130,
        image: "/assets/images/cup-of-tea.jpg",
      },
    ],
  },
  {
    id: "cold-drinks",
    title: "نوشیدنی سرد",
    items: [
      {
        id: "mojito",
        name: "موهیتو",
        description: "",
        price: 150,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "red-mojito",
        name: "رد موهیتو",
        description: "",
        price: 180,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "lemonade",
        name: "لیموناد",
        description: "",
        price: 140,
        image: "/assets/images/cold drinks/Lemonade.webp",
      },
    ],
  },
  {
    id: "hot-drinks",
    title: "نوشیدنی های گرم",
    items: [
      {
        id: "hot-chocolate",
        name: "هات چاکلت",
        description: "",
        price: 150,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "hot-chocolate-hazelnut",
        name: "هات چاکت و فندق",
        description: "",
        price: 160,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "white-chocolate",
        name: "وایت چاکلت",
        description: "",
        price: 140,
        image: "/assets/images/a-cup-espresso.png",
      },
      {
        id: "masala",
        name: "ماسالا",
        description: "",
        price: 150,
        image: "/assets/images/a-cup-espresso.png",
      },
    ],
  },
  {
    id: "cakes",
    title: "کیک و دسر",
    items: [
      {
        id: "chocolate-cake",
        name: "کیک شکلاتی فردو (Feredo)",
        description: "",
        price: 104.5,
        image: "/assets/images/cakes/chocolate cake.webp",
      },
      {
        id: "mocha-cake",
        name: "کیک موکا",
        description: "",
        price: 94.6,
        image: "/assets/images/cakes/chocolate cake.webp",
      },
      {
        id: "apple-cinnamon-cake",
        name: "کیک سیب دارچین",
        description: "",
        price: 94.6,
        image: "/assets/images/a-cup-espresso.png",
      },
    ],
  },
];

export const navigationItems = [
  {
    id: "espresso",
    title: "بر پایه ی اسپرسو",
    icon: "/assets/images/icons/icon-coffee.png",
  },
  {
    id: "shakes",
    title: "شیک ها",
    icon: "/assets/images/icons/icon-shakes.png",
  },
  {
    id: "cold-drinks",
    title: "بار سرد",
    icon: "/assets/images/icons/cold-drinks.png",
  },
  {
    id: "food",
    title: "غذا ها",
    icon: "/assets/images/icons/foods.png",
  },
  {
    id: "hot-drinks",
    title: "نوشیدنی گرم",
    icon: "/assets/images/icons/icon-coffee.png",
  },
  {
    id: "tea",
    title: "چای و دمنوش",
    icon: "/assets/images/icons/tea.png",
  },
  {
    id: "cakes",
    title: "کیک و دسر",
    icon: "/assets/images/icons/cake.png",
  },
];

