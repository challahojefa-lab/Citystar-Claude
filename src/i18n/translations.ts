import type { ProductUnit } from '../db/types';

export type Language = 'en' | 'gu';

export const LANGUAGES: ReadonlyArray<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'ગુજરાતી' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export interface NavItemText {
  title: string;
  description: string;
}

export interface Translations {
  app: {
    name: string;
    tagline: string;
  };
  language: {
    label: string;
  };
  summary: {
    title: string;
    demoNotice: string;
    todaySales: string;
    toReceive: string;
    toPay: string;
  };
  menu: {
    title: string;
    sales: NavItemText;
    purchase: NavItemText;
    inventory: NavItemText;
    customers: NavItemText;
    reports: NavItemText;
  };
  notReady: {
    badge: string;
    heading: string;
    /** Use {name} as the placeholder for the section name. */
    message: string;
    ok: string;
  };
  inventory: {
    title: string;
    back: string;
    addProduct: string;
    searchLabel: string;
    searchPlaceholder: string;
    /** Use {count} as the placeholder. */
    count: string;
    loading: string;
    retry: string;
    saved: string;
    empty: { title: string; message: string };
    /** Use {query} as the placeholder. */
    noResults: string;
    card: {
      category: string;
      unit: string;
      purchasePrice: string;
      sellingPrice: string;
      stock: string;
      noCategory: string;
      notSet: string;
      stockNotRecorded: string;
      edit: string;
      /** Use {name} as the placeholder. */
      editAria: string;
    };
    form: {
      addTitle: string;
      editTitle: string;
      fixErrors: string;
      nameLabel: string;
      categoryLabel: string;
      categoryHint: string;
      categoryPick: string;
      unitLabel: string;
      purchasePriceLabel: string;
      sellingPriceLabel: string;
      priceHint: string;
      save: string;
      saving: string;
      cancel: string;
    };
    units: Record<ProductUnit, string>;
    errors: {
      nameRequired: string;
      nameTooLong: string;
      nameDuplicate: string;
      categoryTooLong: string;
      priceInvalid: string;
      storageFull: string;
      saveFailed: string;
      loadFailed: string;
      notFound: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      name: 'Citystar Hardware',
      tagline: 'Hardware & Utensils Shop',
    },
    language: {
      label: 'Language',
    },
    summary: {
      title: "Today's Summary",
      demoNotice: 'DEMO DATA – sample numbers only',
      todaySales: "Today's Sales",
      toReceive: 'Money to Receive',
      toPay: 'Money to Pay',
    },
    menu: {
      title: 'What do you want to do?',
      sales: {
        title: 'Sales',
        description: 'Make bills and record sales',
      },
      purchase: {
        title: 'Purchase',
        description: 'Record goods bought',
      },
      inventory: {
        title: 'Inventory',
        description: 'See stock in the shop',
      },
      customers: {
        title: 'Customers',
        description: 'Customer list and credit',
      },
      reports: {
        title: 'Reports',
        description: 'Sales and profit details',
      },
    },
    notReady: {
      badge: 'Coming soon',
      heading: 'Not ready yet',
      message: '{name} is not ready yet. It will be added in a later step.',
      ok: 'OK',
    },
    inventory: {
      title: 'Inventory',
      back: 'Back',
      addProduct: 'Add Product',
      searchLabel: 'Search products',
      searchPlaceholder: 'Type product name or category',
      count: 'Products: {count}',
      loading: 'Loading products...',
      retry: 'Try again',
      saved: 'Product saved.',
      empty: {
        title: 'No products yet',
        message: 'Press "Add Product" to add your first product.',
      },
      noResults: 'No product found for "{query}".',
      card: {
        category: 'Category',
        unit: 'Unit',
        purchasePrice: 'Purchase price',
        sellingPrice: 'Selling price',
        stock: 'Current stock',
        noCategory: 'None',
        notSet: 'Not set',
        stockNotRecorded: 'Not recorded yet',
        edit: 'Edit',
        editAria: 'Edit {name}',
      },
      form: {
        addTitle: 'Add Product',
        editTitle: 'Edit Product',
        fixErrors: 'Please fix the items marked in red.',
        nameLabel: 'Product name',
        categoryLabel: 'Category (optional)',
        categoryHint: 'Example: Tools, Paint, Utensils',
        categoryPick: 'Or choose one you already used:',
        unitLabel: 'Unit',
        purchasePriceLabel: 'Purchase price in ₹ (optional)',
        sellingPriceLabel: 'Selling price in ₹ (optional)',
        priceHint: 'Example: 250 or 99.50',
        save: 'Save',
        saving: 'Saving...',
        cancel: 'Cancel',
      },
      units: {
        piece: 'Piece',
        kg: 'Kg',
        metre: 'Metre',
        box: 'Box',
        pair: 'Pair',
        set: 'Set',
        litre: 'Litre',
        dozen: 'Dozen',
      },
      errors: {
        nameRequired: 'Please type the product name.',
        nameTooLong: 'The name is too long (maximum 100 letters).',
        nameDuplicate: 'A product with this name already exists.',
        categoryTooLong: 'The category is too long (maximum 50 letters).',
        priceInvalid: 'Type a number like 250 or 99.50, or leave it empty.',
        storageFull: 'The phone storage is full. Free some space and try again.',
        saveFailed: 'Could not save. Nothing was changed. Please try again.',
        loadFailed: 'Could not open the product list. Please try again.',
        notFound: 'This product was not found. It may have been removed.',
      },
    },
  },
  gu: {
    app: {
      name: 'Citystar Hardware',
      tagline: 'હાર્ડવેર અને વાસણોની દુકાન',
    },
    language: {
      label: 'ભાષા',
    },
    summary: {
      title: 'આજનો સારાંશ',
      demoNotice: 'ડેમો ડેટા – ફક્ત નમૂનાના આંકડા',
      todaySales: 'આજનું વેચાણ',
      toReceive: 'લેવાના પૈસા',
      toPay: 'આપવાના પૈસા',
    },
    menu: {
      title: 'તમારે શું કરવું છે?',
      sales: {
        title: 'વેચાણ',
        description: 'બિલ બનાવો અને વેચાણ નોંધો',
      },
      purchase: {
        title: 'ખરીદી',
        description: 'ખરીદેલો માલ નોંધો',
      },
      inventory: {
        title: 'સ્ટોક',
        description: 'દુકાનમાં માલ કેટલો છે તે જુઓ',
      },
      customers: {
        title: 'ગ્રાહકો',
        description: 'ગ્રાહકોની યાદી અને ઉધાર',
      },
      reports: {
        title: 'રિપોર્ટ',
        description: 'વેચાણ અને નફાની માહિતી',
      },
    },
    notReady: {
      badge: 'ટૂંક સમયમાં',
      heading: 'હજુ તૈયાર નથી',
      message: '{name} હજુ તૈયાર નથી. તે આગળના તબક્કામાં ઉમેરવામાં આવશે.',
      ok: 'ઠીક છે',
    },
    inventory: {
      title: 'સ્ટોક',
      back: 'પાછા જાઓ',
      addProduct: 'નવો માલ ઉમેરો',
      searchLabel: 'માલ શોધો',
      searchPlaceholder: 'માલનું નામ કે પ્રકાર લખો',
      count: 'માલ: {count}',
      loading: 'માલની યાદી લોડ થઈ રહી છે...',
      retry: 'ફરી પ્રયત્ન કરો',
      saved: 'માલ સાચવ્યો.',
      empty: {
        title: 'હજુ કોઈ માલ ઉમેર્યો નથી',
        message: 'પહેલો માલ ઉમેરવા "નવો માલ ઉમેરો" બટન દબાવો.',
      },
      noResults: '"{query}" માટે કોઈ માલ મળ્યો નથી.',
      card: {
        category: 'પ્રકાર',
        unit: 'એકમ',
        purchasePrice: 'ખરીદ ભાવ',
        sellingPrice: 'વેચાણ ભાવ',
        stock: 'હાલનો સ્ટોક',
        noCategory: 'નથી',
        notSet: 'લખ્યો નથી',
        stockNotRecorded: 'હજુ નોંધાયો નથી',
        edit: 'ફેરફાર કરો',
        editAria: '{name} માં ફેરફાર કરો',
      },
      form: {
        addTitle: 'નવો માલ ઉમેરો',
        editTitle: 'માલમાં ફેરફાર કરો',
        fixErrors: 'કૃપા કરીને લાલ નિશાનવાળી બાબતો સુધારો.',
        nameLabel: 'માલનું નામ',
        categoryLabel: 'પ્રકાર (ઇચ્છા મુજબ)',
        categoryHint: 'ઉદાહરણ: ઓજારો, રંગ, વાસણો',
        categoryPick: 'અથવા પહેલા વાપરેલો પ્રકાર પસંદ કરો:',
        unitLabel: 'એકમ (માપ)',
        purchasePriceLabel: 'ખરીદ ભાવ ₹ (ઇચ્છા મુજબ)',
        sellingPriceLabel: 'વેચાણ ભાવ ₹ (ઇચ્છા મુજબ)',
        priceHint: 'ઉદાહરણ: 250 અથવા 99.50',
        save: 'સાચવો',
        saving: 'સાચવી રહ્યા છીએ...',
        cancel: 'રદ કરો',
      },
      units: {
        piece: 'નંગ',
        kg: 'કિલો',
        metre: 'મીટર',
        box: 'બોક્સ',
        pair: 'જોડી',
        set: 'સેટ',
        litre: 'લિટર',
        dozen: 'ડઝન',
      },
      errors: {
        nameRequired: 'કૃપા કરીને માલનું નામ લખો.',
        nameTooLong: 'નામ બહુ લાંબુ છે (વધુમાં વધુ 100 અક્ષર).',
        nameDuplicate: 'આ નામનો માલ પહેલેથી છે.',
        categoryTooLong: 'પ્રકાર બહુ લાંબો છે (વધુમાં વધુ 50 અક્ષર).',
        priceInvalid: 'ભાવ આ રીતે લખો: 250 અથવા 99.50, અથવા ખાલી રાખો.',
        storageFull: 'ફોનમાં જગ્યા ભરાઈ ગઈ છે. જગ્યા ખાલી કરીને ફરી પ્રયત્ન કરો.',
        saveFailed: 'સાચવી શકાયું નથી. કંઈ બદલાયું નથી. ફરી પ્રયત્ન કરો.',
        loadFailed: 'માલની યાદી ખોલી શકાઈ નથી. ફરી પ્રયત્ન કરો.',
        notFound: 'આ માલ મળ્યો નથી. કદાચ તે કાઢી નંખાયો હશે.',
      },
    },
  },
};
