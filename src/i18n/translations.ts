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
      stockQuantityInvalid: string;
      stockQuantityWhole: string;
    };
    stock: {
      enterButton: string;
      changeButton: string;
      /** Use {name} as the placeholder. */
      buttonAria: string;
      formTitle: string;
      currentLabel: string;
      /** Use {unit} as the placeholder. */
      quantityLabel: string;
      hint: string;
      save: string;
      saving: string;
      cancel: string;
      saved: string;
    };
  };
  sales: {
    title: string;
    back: string;
    newSale: string;
    loading: string;
    retry: string;
    /** Use {total} as the placeholder. */
    saved: string;
    savedStockNote: string;
    recentTitle: string;
    noSales: string;
    walkIn: string;
    /** Use {count} as the placeholder. */
    itemsCount: string;
    form: {
      title: string;
      fixErrors: string;
      itemsTitle: string;
      noItems: string;
      searchLabel: string;
      searchPlaceholder: string;
      /** Use {query} as the placeholder. */
      noMatch: string;
      noProductsAtAll: string;
      moreResults: string;
      /** Use {qty} and {unit} as placeholders. */
      available: string;
      outOfStock: string;
      noPrice: string;
      inSale: string;
      quantityLabel: string;
      /** Use {name} as the placeholder. */
      quantityAria: string;
      priceLabel: string;
      lineTotal: string;
      remove: string;
      /** Use {name} as the placeholder. */
      removeAria: string;
      grandTotal: string;
      customerTitle: string;
      customerName: string;
      customerPhone: string;
      phoneHint: string;
      save: string;
      saving: string;
      cancel: string;
    };
    errors: {
      noItems: string;
      quantityInvalid: string;
      quantityWhole: string;
      /** Use {available} and {unit} as placeholders. */
      insufficientStock: string;
      priceMissing: string;
      productMissing: string;
      phoneInvalid: string;
      nameTooLong: string;
      storageFull: string;
      saveFailed: string;
      loadFailed: string;
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
        stockQuantityInvalid: 'Type a quantity of 0 or more, like 25 or 2.5.',
        stockQuantityWhole: 'This item is counted in whole numbers only, like 1, 2 or 3.',
      },
      stock: {
        enterButton: 'Enter Stock',
        changeButton: 'Change Stock',
        buttonAria: 'Stock of {name}',
        formTitle: 'Stock Quantity',
        currentLabel: 'Current stock',
        quantityLabel: 'How many {unit} are in the shop now?',
        hint: 'Type the quantity you counted. Type 0 if there is none.',
        save: 'Save Stock',
        saving: 'Saving...',
        cancel: 'Cancel',
        saved: 'Stock saved.',
      },
    },
    sales: {
      title: 'Sales',
      back: 'Back',
      newSale: 'New Sale',
      loading: 'Loading...',
      retry: 'Try again',
      saved: 'Sale saved. Total: {total}',
      savedStockNote: 'The stock was reduced.',
      recentTitle: 'Recent sales',
      noSales: 'No sales saved yet.',
      walkIn: 'No customer name',
      itemsCount: '{count} items',
      form: {
        title: 'New Sale',
        fixErrors: 'Please fix the items marked in red.',
        itemsTitle: 'Items in this sale',
        noItems: 'No items added yet. Search a product below and tap it.',
        searchLabel: 'Search product',
        searchPlaceholder: 'Type product name',
        noMatch: 'No product found for "{query}".',
        noProductsAtAll: 'There are no products yet. Add products in Inventory first.',
        moreResults: 'More products exist. Type more letters to find them.',
        available: 'Stock: {qty} {unit}',
        outOfStock: 'No stock - cannot sell',
        noPrice: 'No selling price - set it in Inventory',
        inSale: 'Already in this sale',
        quantityLabel: 'Quantity',
        quantityAria: 'Quantity of {name}',
        priceLabel: 'Price',
        lineTotal: 'Amount',
        remove: 'Remove',
        removeAria: 'Remove {name} from this sale',
        grandTotal: 'Grand Total',
        customerTitle: 'Customer (optional)',
        customerName: 'Customer name',
        customerPhone: 'Phone number',
        phoneHint: 'Example: 9876543210',
        save: 'Save Sale',
        saving: 'Saving...',
        cancel: 'Cancel',
      },
      errors: {
        noItems: 'Add at least one product to the sale.',
        quantityInvalid: 'Type a quantity above 0, like 2 or 1.5.',
        quantityWhole: 'This item is sold in whole numbers only, like 1, 2 or 3.',
        insufficientStock: 'Not enough stock. Only {available} {unit} available.',
        priceMissing: 'This product has no selling price. Set it in Inventory.',
        productMissing: 'This product was not found. Remove it from the sale.',
        phoneInvalid: 'Type a 10-digit mobile number, or leave it empty.',
        nameTooLong: 'The name is too long (maximum 60 letters).',
        storageFull: 'The phone storage is full. Free some space and try again.',
        saveFailed: 'Could not save the sale. Nothing was changed. Please try again.',
        loadFailed: 'Could not open the products. Please try again.',
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
        stockQuantityInvalid: 'જથ્થો 0 કે તેથી વધુ લખો, જેમ કે 25 અથવા 2.5.',
        stockQuantityWhole: 'આ વસ્તુ આખી સંખ્યામાં જ ગણાય છે, જેમ કે 1, 2 અથવા 3.',
      },
      stock: {
        enterButton: 'સ્ટોક લખો',
        changeButton: 'સ્ટોક બદલો',
        buttonAria: '{name} નો સ્ટોક',
        formTitle: 'સ્ટોકનો જથ્થો',
        currentLabel: 'હાલનો સ્ટોક',
        quantityLabel: 'દુકાનમાં હાલ કેટલા {unit} છે?',
        hint: 'ગણેલો જથ્થો લખો. કંઈ ન હોય તો 0 લખો.',
        save: 'સ્ટોક સાચવો',
        saving: 'સાચવી રહ્યા છીએ...',
        cancel: 'રદ કરો',
        saved: 'સ્ટોક સાચવ્યો.',
      },
    },
    sales: {
      title: 'વેચાણ',
      back: 'પાછા જાઓ',
      newSale: 'નવું વેચાણ',
      loading: 'લોડ થઈ રહ્યું છે...',
      retry: 'ફરી પ્રયત્ન કરો',
      saved: 'વેચાણ સાચવ્યું. કુલ: {total}',
      savedStockNote: 'સ્ટોક ઓછો થયો છે.',
      recentTitle: 'તાજેતરનું વેચાણ',
      noSales: 'હજુ કોઈ વેચાણ સાચવ્યું નથી.',
      walkIn: 'ગ્રાહકનું નામ નથી',
      itemsCount: '{count} વસ્તુ',
      form: {
        title: 'નવું વેચાણ',
        fixErrors: 'કૃપા કરીને લાલ નિશાનવાળી બાબતો સુધારો.',
        itemsTitle: 'આ વેચાણની વસ્તુઓ',
        noItems: 'હજુ કોઈ વસ્તુ ઉમેરી નથી. નીચે માલ શોધો અને તેના પર દબાવો.',
        searchLabel: 'માલ શોધો',
        searchPlaceholder: 'માલનું નામ લખો',
        noMatch: '"{query}" માટે કોઈ માલ મળ્યો નથી.',
        noProductsAtAll: 'હજુ કોઈ માલ નથી. પહેલા સ્ટોકમાં માલ ઉમેરો.',
        moreResults: 'બીજો માલ પણ છે. શોધવા માટે વધુ અક્ષર લખો.',
        available: 'સ્ટોક: {qty} {unit}',
        outOfStock: 'સ્ટોક નથી - વેચી શકાય નહીં',
        noPrice: 'વેચાણ ભાવ નથી - સ્ટોકમાં ભાવ લખો',
        inSale: 'આ વેચાણમાં ઉમેરેલો છે',
        quantityLabel: 'જથ્થો',
        quantityAria: '{name} નો જથ્થો',
        priceLabel: 'ભાવ',
        lineTotal: 'રકમ',
        remove: 'કાઢી નાખો',
        removeAria: '{name} ને વેચાણમાંથી કાઢી નાખો',
        grandTotal: 'કુલ રકમ',
        customerTitle: 'ગ્રાહક (ઇચ્છા મુજબ)',
        customerName: 'ગ્રાહકનું નામ',
        customerPhone: 'ફોન નંબર',
        phoneHint: 'ઉદાહરણ: 9876543210',
        save: 'વેચાણ સાચવો',
        saving: 'સાચવી રહ્યા છીએ...',
        cancel: 'રદ કરો',
      },
      errors: {
        noItems: 'વેચાણમાં ઓછામાં ઓછો એક માલ ઉમેરો.',
        quantityInvalid: 'જથ્થો 0 થી વધુ લખો, જેમ કે 2 અથવા 1.5.',
        quantityWhole: 'આ વસ્તુ આખી સંખ્યામાં જ વેચાય છે, જેમ કે 1, 2 અથવા 3.',
        insufficientStock: 'પૂરતો સ્ટોક નથી. ફક્ત {available} {unit} છે.',
        priceMissing: 'આ માલનો વેચાણ ભાવ નથી. સ્ટોકમાં ભાવ લખો.',
        productMissing: 'આ માલ મળ્યો નથી. તેને વેચાણમાંથી કાઢી નાખો.',
        phoneInvalid: '10 અંકનો મોબાઈલ નંબર લખો, અથવા ખાલી રાખો.',
        nameTooLong: 'નામ બહુ લાંબુ છે (વધુમાં વધુ 60 અક્ષર).',
        storageFull: 'ફોનમાં જગ્યા ભરાઈ ગઈ છે. જગ્યા ખાલી કરીને ફરી પ્રયત્ન કરો.',
        saveFailed: 'વેચાણ સાચવી શકાયું નથી. કંઈ બદલાયું નથી. ફરી પ્રયત્ન કરો.',
        loadFailed: 'માલ ખોલી શકાયો નથી. ફરી પ્રયત્ન કરો.',
      },
    },
  },
};
