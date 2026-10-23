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
    todaySales: string;
    todayPurchases: string;
    products: string;
    toReceive: string;
    unavailable: string;
    loading: string;
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
    /** Use {total} and {name} as placeholders. */
    savedCredit: string;
    savedStockNote: string;
    creditBadge: string;
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
      pickLabel: string;
      pickPlaceholder: string;
      /** Use {query} as the placeholder. */
      pickNone: string;
      orTypeName: string;
      change: string;
      payTypeLabel: string;
      payCredit: string;
      payCash: string;
      /** Use {amount} and {name} as placeholders. */
      creditNote: string;
      cashNote: string;
      /** Use {balance} as the placeholder. */
      balanceNow: string;
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
      customerMissing: string;
      storageFull: string;
      saveFailed: string;
      loadFailed: string;
    };
  };
  purchases: {
    title: string;
    back: string;
    newPurchase: string;
    loading: string;
    retry: string;
    /** Use {total} as the placeholder. */
    saved: string;
    savedStockNote: string;
    recentTitle: string;
    noPurchases: string;
    noSupplier: string;
    /** Use {count} as the placeholder. */
    itemsCount: string;
    form: {
      title: string;
      fixErrors: string;
      itemsTitle: string;
      priceNote: string;
      noItems: string;
      searchLabel: string;
      searchPlaceholder: string;
      /** Use {query} as the placeholder. */
      noMatch: string;
      noProductsAtAll: string;
      moreResults: string;
      /** Use {qty} and {unit} as placeholders. */
      stockNow: string;
      stockNotRecorded: string;
      inPurchase: string;
      /** Use {unit} as the placeholder. */
      quantityLabel: string;
      /** Use {name} as the placeholder. */
      quantityAria: string;
      /** Use {unit} as the placeholder. */
      priceLabel: string;
      /** Use {name} as the placeholder. */
      priceAria: string;
      lineTotal: string;
      remove: string;
      /** Use {name} as the placeholder. */
      removeAria: string;
      grandTotal: string;
      supplierTitle: string;
      supplierName: string;
      supplierPhone: string;
      phoneHint: string;
      save: string;
      saving: string;
      cancel: string;
    };
    errors: {
      noItems: string;
      quantityInvalid: string;
      quantityWhole: string;
      priceInvalid: string;
      productMissing: string;
      phoneInvalid: string;
      nameTooLong: string;
      storageFull: string;
      saveFailed: string;
      loadFailed: string;
    };
  };
  customers: {
    title: string;
    back: string;
    addCustomer: string;
    searchLabel: string;
    searchPlaceholder: string;
    /** Use {count} as the placeholder. */
    count: string;
    loading: string;
    retry: string;
    saved: string;
    /** Use {balance} as the placeholder. */
    paymentSaved: string;
    empty: { title: string; message: string };
    /** Use {query} as the placeholder. */
    noResults: string;
    card: {
      credit: string;
      paid: string;
      balance: string;
      /** Use {name} as the placeholder. */
      openAria: string;
    };
    form: {
      title: string;
      fixErrors: string;
      nameLabel: string;
      phoneLabel: string;
      phoneHint: string;
      notesLabel: string;
      notesHint: string;
      save: string;
      saving: string;
      cancel: string;
    };
    detail: {
      phone: string;
      notes: string;
      recordPayment: string;
      noBalance: string;
      creditSalesTitle: string;
      noCreditSales: string;
      creditTag: string;
      /** Use {count} as the placeholder. */
      itemsCount: string;
      paymentsTitle: string;
      noPayments: string;
    };
    payment: {
      title: string;
      balanceNow: string;
      amountLabel: string;
      amountHint: string;
      /** Use {amount} as the placeholder. */
      fullAmount: string;
      dateLabel: string;
      notesLabel: string;
      notesHint: string;
      save: string;
      saving: string;
      cancel: string;
    };
    errors: {
      nameRequired: string;
      nameTooLong: string;
      phoneInvalid: string;
      notesTooLong: string;
      amountInvalid: string;
      /** Use {balance} as the placeholder. */
      amountExceeds: string;
      dateInvalid: string;
      dateFuture: string;
      customerMissing: string;
      storageFull: string;
      saveFailed: string;
      loadFailed: string;
    };
  };
  backup: {
    title: string;
    description: string;
    button: string;
    working: string;
    share: string;
    /** Use {date}. */
    lastBackup: string;
    never: string;
    doneTitle: string;
    /** Use {count}. */
    doneCount: string;
    doneHint: string;
    empty: string;
    unsupported: string;
    error: string;
    restoreNote: string;
  };
  reports: {
    title: string;
    back: string;
    dateLabel: string;
    todayButton: string;
    loading: string;
    retry: string;
    /** Use {date} as the placeholder. */
    heading: string;
    figures: {
      totalSales: string;
      /** Use {count} as the placeholder. */
      salesCount: string;
      cashSales: string;
      cashHint: string;
      creditSales: string;
      creditHint: string;
      totalPurchases: string;
      /** Use {count} as the placeholder. */
      purchasesCount: string;
      payments: string;
      paymentsHint: string;
      /** Use {count} as the placeholder. */
      paymentsCount: string;
    };
    profit: {
      title: string;
      estimateNote: string;
      noSales: string;
      completeNote: string;
      incompleteTitle: string;
      /** Use {count} and {amount} as placeholders. */
      incompleteText: string;
      knownLabel: string;
      unavailableTitle: string;
      unavailableText: string;
      /** Use {names} as the placeholder. */
      missingItems: string;
      /** Use {count} as the placeholder. */
      andMore: string;
    };
    owed: {
      title: string;
      none: string;
      /** Use {count} as the placeholder. */
      customers: string;
      nowNote: string;
    };
    lists: {
      salesTitle: string;
      noSales: string;
      purchasesTitle: string;
      noPurchases: string;
      walkIn: string;
      noSupplier: string;
      creditTag: string;
      /** Use {count} as the placeholder. */
      itemsCount: string;
    };
    about: {
      title: string;
      cash: string;
      payments: string;
      profit: string;
      notAccounting: string;
    };
    errors: {
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
      todaySales: "Today's Sales",
      todayPurchases: "Today's Purchases",
      products: 'Total Products',
      toReceive: 'Money to Receive',
      unavailable: 'Not available',
      loading: '…',
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
      savedCredit: "Sale saved as CREDIT. {total} was added to {name}'s balance.",
      savedStockNote: 'The stock was reduced.',
      creditBadge: 'CREDIT',
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
        pickLabel: 'Choose a saved customer',
        pickPlaceholder: 'Type customer name',
        pickNone: 'No saved customer matches "{query}".',
        orTypeName: 'Or just type a name (not linked to any customer account):',
        change: 'Change customer',
        payTypeLabel: 'How is this sale paid?',
        payCredit: 'Credit (add to balance)',
        payCash: 'Paid in cash',
        creditNote: "CREDIT SALE: {amount} will be added to {name}'s balance.",
        cashNote: 'Paid in cash. This sale is not added to the balance.',
        balanceNow: 'Balance due now: {balance}',
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
        customerMissing: 'This customer was not found. Change the customer and try again.',
        storageFull: 'The phone storage is full. Free some space and try again.',
        saveFailed: 'Could not save the sale. Nothing was changed. Please try again.',
        loadFailed: 'Could not open the products. Please try again.',
      },
    },
    purchases: {
      title: 'Purchase',
      back: 'Back',
      newPurchase: 'New Purchase',
      loading: 'Loading...',
      retry: 'Try again',
      saved: 'Purchase saved. Total: {total}',
      savedStockNote: 'The stock was increased.',
      recentTitle: 'Recent purchases',
      noPurchases: 'No purchases saved yet.',
      noSupplier: 'No supplier name',
      itemsCount: '{count} items',
      form: {
        title: 'New Purchase',
        fixErrors: 'Please fix the items marked in red.',
        itemsTitle: 'Items in this purchase',
        priceNote: "Saving will also update each product's purchase price to the price you type.",
        noItems: 'No items added yet. Search a product below and tap it.',
        searchLabel: 'Search product',
        searchPlaceholder: 'Type product name',
        noMatch: 'No product found for "{query}".',
        noProductsAtAll: 'There are no products yet. Add products in Inventory first.',
        moreResults: 'More products exist. Type more letters to find them.',
        stockNow: 'Stock now: {qty} {unit}',
        stockNotRecorded: 'Stock not recorded yet',
        inPurchase: 'Already in this purchase',
        quantityLabel: 'Quantity bought ({unit})',
        quantityAria: 'Quantity of {name}',
        priceLabel: 'Purchase price per {unit} (₹)',
        priceAria: 'Purchase price of {name}',
        lineTotal: 'Amount',
        remove: 'Remove',
        removeAria: 'Remove {name} from this purchase',
        grandTotal: 'Grand Total',
        supplierTitle: 'Supplier (optional)',
        supplierName: 'Supplier name',
        supplierPhone: 'Phone number',
        phoneHint: 'Example: 9876543210',
        save: 'Save Purchase',
        saving: 'Saving...',
        cancel: 'Cancel',
      },
      errors: {
        noItems: 'Add at least one product to the purchase.',
        quantityInvalid: 'Type a quantity above 0, like 2 or 1.5.',
        quantityWhole: 'This item is counted in whole numbers only, like 1, 2 or 3.',
        priceInvalid: 'Type the price like 250 or 99.50. It cannot be negative.',
        productMissing: 'This product was not found. Remove it from the purchase.',
        phoneInvalid: 'Type a 10-digit mobile number, or leave it empty.',
        nameTooLong: 'The name is too long (maximum 60 letters).',
        storageFull: 'The phone storage is full. Free some space and try again.',
        saveFailed: 'Could not save the purchase. Nothing was changed. Please try again.',
        loadFailed: 'Could not open the products. Please try again.',
      },
    },
    customers: {
      title: 'Customers',
      back: 'Back',
      addCustomer: 'Add Customer',
      searchLabel: 'Search customer',
      searchPlaceholder: 'Type name or phone',
      count: 'Customers: {count}',
      loading: 'Loading...',
      retry: 'Try again',
      saved: 'Customer saved.',
      paymentSaved: 'Payment saved. Balance due now: {balance}',
      empty: {
        title: 'No customers yet',
        message: 'Press "Add Customer" to add your first customer.',
      },
      noResults: 'No customer found for "{query}".',
      card: {
        credit: 'Credit sales',
        paid: 'Payments received',
        balance: 'Balance due',
        openAria: 'Open {name}',
      },
      form: {
        title: 'Add Customer',
        fixErrors: 'Please fix the items marked in red.',
        nameLabel: 'Customer name',
        phoneLabel: 'Phone number (optional)',
        phoneHint: 'Example: 9876543210',
        notesLabel: 'Notes (optional)',
        notesHint: 'Example: Lives near the bus stand',
        save: 'Save Customer',
        saving: 'Saving...',
        cancel: 'Cancel',
      },
      detail: {
        phone: 'Phone',
        notes: 'Notes',
        recordPayment: 'Record Payment',
        noBalance: 'No balance due. There is nothing to receive.',
        creditSalesTitle: 'Credit sales',
        noCreditSales: 'No credit sales yet.',
        creditTag: 'CREDIT',
        itemsCount: '{count} items',
        paymentsTitle: 'Payment history',
        noPayments: 'No payments received yet.',
      },
      payment: {
        title: 'Record Payment',
        balanceNow: 'Balance due',
        amountLabel: 'Amount received (₹)',
        amountHint: 'Example: 500 or 250.50',
        fullAmount: 'Full balance: {amount}',
        dateLabel: 'Date received',
        notesLabel: 'Notes (optional)',
        notesHint: 'Example: Paid by UPI',
        save: 'Save Payment',
        saving: 'Saving...',
        cancel: 'Cancel',
      },
      errors: {
        nameRequired: 'Please type the customer name.',
        nameTooLong: 'The name is too long (maximum 60 letters).',
        phoneInvalid: 'Type a 10-digit mobile number, or leave it empty.',
        notesTooLong: 'The notes are too long (maximum 200 letters).',
        amountInvalid: 'Type an amount above 0, like 500 or 250.50.',
        amountExceeds: 'The amount is more than the balance due ({balance}).',
        dateInvalid: 'Please choose a valid date.',
        dateFuture: 'The date cannot be in the future.',
        customerMissing: 'This customer was not found.',
        storageFull: 'The phone storage is full. Free some space and try again.',
        saveFailed: 'Could not save. Nothing was changed. Please try again.',
        loadFailed: 'Could not open the customers. Please try again.',
      },
    },
    backup: {
      title: 'Backup',
      description: 'Save a copy of all your shop data in one file. Keep that file somewhere safe.',
      button: 'Backup Now',
      working: 'Saving backup…',
      share: 'Send Backup File',
      lastBackup: 'Last backup: {date}',
      never: 'No backup made on this device yet.',
      doneTitle: 'Backup file created.',
      doneCount: '{count} records saved.',
      doneHint: 'Your phone or browser chooses where it goes (usually Downloads). Copy it to a safe place.',
      empty: 'There is no shop data to back up yet.',
      unsupported: 'This device cannot save files from the app. Your data is safe and unchanged.',
      error: 'Backup failed. Your data is safe and unchanged. Please try again.',
      restoreNote: 'This only saves a copy. Restoring from a backup is not available yet.',
    },
    reports: {
      title: 'Reports',
      back: 'Back',
      dateLabel: 'Report date',
      todayButton: 'Today',
      loading: 'Loading...',
      retry: 'Try again',
      heading: 'Report for {date}',
      figures: {
        totalSales: 'Total sales',
        salesCount: '{count} sales',
        cashSales: 'Cash sales',
        cashHint: 'Sales not put on credit',
        creditSales: 'Credit sales',
        creditHint: 'Sold on credit. Money not received yet.',
        totalPurchases: 'Total purchases',
        purchasesCount: '{count} purchases',
        payments: 'Customer payments collected',
        paymentsHint: 'Money received from customers. Not counted as sales.',
        paymentsCount: '{count} payments',
      },
      profit: {
        title: 'Estimated gross profit',
        estimateNote: 'Sales value minus the recorded purchase cost of the items sold. This is an estimate.',
        noSales: 'No sales on this date, so there is no profit to show.',
        completeNote: 'Worked out from the recorded purchase cost of every item sold.',
        incompleteTitle: 'INCOMPLETE - do not rely on this',
        incompleteText:
          '{count} sold product(s) have no recorded purchase cost, so {amount} of sales is NOT included. The profit above is only for items with a known cost. It is not the full profit for the day.',
        knownLabel: 'Profit on items with a known cost',
        unavailableTitle: 'Profit not available',
        unavailableText:
          'None of the items sold have a recorded purchase cost. Record your purchases in Purchase to see profit.',
        missingItems: 'Items without a cost: {names}',
        andMore: 'and {count} more',
      },
      owed: {
        title: 'Customers owe you (right now)',
        none: 'No customer owes you anything.',
        customers: '{count} customer(s) have a balance due',
        nowNote: 'This is the balance today, not the balance on the date you picked.',
      },
      lists: {
        salesTitle: 'Sales on this date',
        noSales: 'No sales on this date.',
        purchasesTitle: 'Purchases on this date',
        noPurchases: 'No purchases on this date.',
        walkIn: 'No customer name',
        noSupplier: 'No supplier name',
        creditTag: 'CREDIT',
        itemsCount: '{count} items',
      },
      about: {
        title: 'About these figures',
        cash: 'Cash sales means every sale that was not put on a customer\'s credit. Sales saved before credit tracking began are counted here.',
        payments: 'Customer payments are money received. They are shown separately and are not new sales.',
        profit: 'Profit uses the latest purchase price you recorded before each sale. If a product has no recorded purchase, its profit is left out and clearly marked.',
        notAccounting: 'This is a basic daily summary. It is not an accounting or tax report.',
      },
      errors: {
        loadFailed: 'Could not open the report. Please try again.',
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
      todaySales: 'આજનું વેચાણ',
      todayPurchases: 'આજની ખરીદી',
      products: 'કુલ વસ્તુઓ',
      toReceive: 'લેવાના પૈસા',
      unavailable: 'ઉપલબ્ધ નથી',
      loading: '…',
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
      savedCredit: 'વેચાણ ઉધાર તરીકે સાચવ્યું. {total} {name} ના બાકી ખાતામાં ઉમેરાયા.',
      savedStockNote: 'સ્ટોક ઓછો થયો છે.',
      creditBadge: 'ઉધાર',
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
        pickLabel: 'સાચવેલો ગ્રાહક પસંદ કરો',
        pickPlaceholder: 'ગ્રાહકનું નામ લખો',
        pickNone: '"{query}" માટે કોઈ સાચવેલો ગ્રાહક મળ્યો નથી.',
        orTypeName: 'અથવા ફક્ત નામ લખો (કોઈ ગ્રાહક ખાતા સાથે જોડાશે નહીં):',
        change: 'ગ્રાહક બદલો',
        payTypeLabel: 'આ વેચાણના પૈસા કેવી રીતે મળ્યા?',
        payCredit: 'ઉધાર (બાકીમાં ઉમેરો)',
        payCash: 'રોકડા મળ્યા',
        creditNote: 'ઉધાર વેચાણ: {amount} {name} ના બાકી ખાતામાં ઉમેરાશે.',
        cashNote: 'રોકડા મળ્યા. આ વેચાણ બાકીમાં ઉમેરાશે નહીં.',
        balanceNow: 'હાલની બાકી રકમ: {balance}',
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
        customerMissing: 'આ ગ્રાહક મળ્યો નથી. ગ્રાહક બદલીને ફરી પ્રયત્ન કરો.',
        storageFull: 'ફોનમાં જગ્યા ભરાઈ ગઈ છે. જગ્યા ખાલી કરીને ફરી પ્રયત્ન કરો.',
        saveFailed: 'વેચાણ સાચવી શકાયું નથી. કંઈ બદલાયું નથી. ફરી પ્રયત્ન કરો.',
        loadFailed: 'માલ ખોલી શકાયો નથી. ફરી પ્રયત્ન કરો.',
      },
    },
    purchases: {
      title: 'ખરીદી',
      back: 'પાછા જાઓ',
      newPurchase: 'નવી ખરીદી',
      loading: 'લોડ થઈ રહ્યું છે...',
      retry: 'ફરી પ્રયત્ન કરો',
      saved: 'ખરીદી સાચવી. કુલ: {total}',
      savedStockNote: 'સ્ટોક વધ્યો છે.',
      recentTitle: 'તાજેતરની ખરીદી',
      noPurchases: 'હજુ કોઈ ખરીદી સાચવી નથી.',
      noSupplier: 'સપ્લાયરનું નામ નથી',
      itemsCount: '{count} વસ્તુ',
      form: {
        title: 'નવી ખરીદી',
        fixErrors: 'કૃપા કરીને લાલ નિશાનવાળી બાબતો સુધારો.',
        itemsTitle: 'આ ખરીદીની વસ્તુઓ',
        priceNote: 'સાચવતાં દરેક માલનો ખરીદ ભાવ તમે લખેલા ભાવ મુજબ બદલાશે.',
        noItems: 'હજુ કોઈ વસ્તુ ઉમેરી નથી. નીચે માલ શોધો અને તેના પર દબાવો.',
        searchLabel: 'માલ શોધો',
        searchPlaceholder: 'માલનું નામ લખો',
        noMatch: '"{query}" માટે કોઈ માલ મળ્યો નથી.',
        noProductsAtAll: 'હજુ કોઈ માલ નથી. પહેલા સ્ટોકમાં માલ ઉમેરો.',
        moreResults: 'બીજો માલ પણ છે. શોધવા માટે વધુ અક્ષર લખો.',
        stockNow: 'હાલનો સ્ટોક: {qty} {unit}',
        stockNotRecorded: 'સ્ટોક હજુ નોંધાયો નથી',
        inPurchase: 'આ ખરીદીમાં ઉમેરેલો છે',
        quantityLabel: 'ખરીદેલો જથ્થો ({unit})',
        quantityAria: '{name} નો જથ્થો',
        priceLabel: 'ખરીદ ભાવ, પ્રતિ {unit} (₹)',
        priceAria: '{name} નો ખરીદ ભાવ',
        lineTotal: 'રકમ',
        remove: 'કાઢી નાખો',
        removeAria: '{name} ને ખરીદીમાંથી કાઢી નાખો',
        grandTotal: 'કુલ રકમ',
        supplierTitle: 'સપ્લાયર (ઇચ્છા મુજબ)',
        supplierName: 'સપ્લાયરનું નામ',
        supplierPhone: 'ફોન નંબર',
        phoneHint: 'ઉદાહરણ: 9876543210',
        save: 'ખરીદી સાચવો',
        saving: 'સાચવી રહ્યા છીએ...',
        cancel: 'રદ કરો',
      },
      errors: {
        noItems: 'ખરીદીમાં ઓછામાં ઓછો એક માલ ઉમેરો.',
        quantityInvalid: 'જથ્થો 0 થી વધુ લખો, જેમ કે 2 અથવા 1.5.',
        quantityWhole: 'આ વસ્તુ આખી સંખ્યામાં જ ગણાય છે, જેમ કે 1, 2 અથવા 3.',
        priceInvalid: 'ભાવ આ રીતે લખો: 250 અથવા 99.50. તે માઇનસમાં ન હોઈ શકે.',
        productMissing: 'આ માલ મળ્યો નથી. તેને ખરીદીમાંથી કાઢી નાખો.',
        phoneInvalid: '10 અંકનો મોબાઈલ નંબર લખો, અથવા ખાલી રાખો.',
        nameTooLong: 'નામ બહુ લાંબુ છે (વધુમાં વધુ 60 અક્ષર).',
        storageFull: 'ફોનમાં જગ્યા ભરાઈ ગઈ છે. જગ્યા ખાલી કરીને ફરી પ્રયત્ન કરો.',
        saveFailed: 'ખરીદી સાચવી શકાઈ નથી. કંઈ બદલાયું નથી. ફરી પ્રયત્ન કરો.',
        loadFailed: 'માલ ખોલી શકાયો નથી. ફરી પ્રયત્ન કરો.',
      },
    },
    customers: {
      title: 'ગ્રાહકો',
      back: 'પાછા જાઓ',
      addCustomer: 'નવો ગ્રાહક ઉમેરો',
      searchLabel: 'ગ્રાહક શોધો',
      searchPlaceholder: 'નામ કે ફોન લખો',
      count: 'ગ્રાહકો: {count}',
      loading: 'લોડ થઈ રહ્યું છે...',
      retry: 'ફરી પ્રયત્ન કરો',
      saved: 'ગ્રાહક સાચવ્યો.',
      paymentSaved: 'ચુકવણી સાચવી. હાલની બાકી રકમ: {balance}',
      empty: {
        title: 'હજુ કોઈ ગ્રાહક નથી',
        message: 'પહેલો ગ્રાહક ઉમેરવા "નવો ગ્રાહક ઉમેરો" બટન દબાવો.',
      },
      noResults: '"{query}" માટે કોઈ ગ્રાહક મળ્યો નથી.',
      card: {
        credit: 'ઉધાર વેચાણ',
        paid: 'મળેલી ચુકવણી',
        balance: 'બાકી રકમ',
        openAria: '{name} ખોલો',
      },
      form: {
        title: 'નવો ગ્રાહક ઉમેરો',
        fixErrors: 'કૃપા કરીને લાલ નિશાનવાળી બાબતો સુધારો.',
        nameLabel: 'ગ્રાહકનું નામ',
        phoneLabel: 'ફોન નંબર (ઇચ્છા મુજબ)',
        phoneHint: 'ઉદાહરણ: 9876543210',
        notesLabel: 'નોંધ (ઇચ્છા મુજબ)',
        notesHint: 'ઉદાહરણ: બસ સ્ટેન્ડ પાસે રહે છે',
        save: 'ગ્રાહક સાચવો',
        saving: 'સાચવી રહ્યા છીએ...',
        cancel: 'રદ કરો',
      },
      detail: {
        phone: 'ફોન',
        notes: 'નોંધ',
        recordPayment: 'ચુકવણી નોંધો',
        noBalance: 'કોઈ બાકી રકમ નથી. લેવાના કોઈ પૈસા નથી.',
        creditSalesTitle: 'ઉધાર વેચાણ',
        noCreditSales: 'હજુ કોઈ ઉધાર વેચાણ નથી.',
        creditTag: 'ઉધાર',
        itemsCount: '{count} વસ્તુ',
        paymentsTitle: 'ચુકવણીનો ઇતિહાસ',
        noPayments: 'હજુ કોઈ ચુકવણી મળી નથી.',
      },
      payment: {
        title: 'ચુકવણી નોંધો',
        balanceNow: 'બાકી રકમ',
        amountLabel: 'મળેલી રકમ (₹)',
        amountHint: 'ઉદાહરણ: 500 અથવા 250.50',
        fullAmount: 'પૂરી બાકી રકમ: {amount}',
        dateLabel: 'પૈસા મળ્યાની તારીખ',
        notesLabel: 'નોંધ (ઇચ્છા મુજબ)',
        notesHint: 'ઉદાહરણ: UPI થી મળ્યા',
        save: 'ચુકવણી સાચવો',
        saving: 'સાચવી રહ્યા છીએ...',
        cancel: 'રદ કરો',
      },
      errors: {
        nameRequired: 'કૃપા કરીને ગ્રાહકનું નામ લખો.',
        nameTooLong: 'નામ બહુ લાંબુ છે (વધુમાં વધુ 60 અક્ષર).',
        phoneInvalid: '10 અંકનો મોબાઈલ નંબર લખો, અથવા ખાલી રાખો.',
        notesTooLong: 'નોંધ બહુ લાંબી છે (વધુમાં વધુ 200 અક્ષર).',
        amountInvalid: 'રકમ 0 થી વધુ લખો, જેમ કે 500 અથવા 250.50.',
        amountExceeds: 'રકમ બાકી રકમ ({balance}) કરતાં વધુ છે.',
        dateInvalid: 'કૃપા કરીને સાચી તારીખ પસંદ કરો.',
        dateFuture: 'તારીખ આવતા દિવસની ન હોઈ શકે.',
        customerMissing: 'આ ગ્રાહક મળ્યો નથી.',
        storageFull: 'ફોનમાં જગ્યા ભરાઈ ગઈ છે. જગ્યા ખાલી કરીને ફરી પ્રયત્ન કરો.',
        saveFailed: 'સાચવી શકાયું નથી. કંઈ બદલાયું નથી. ફરી પ્રયત્ન કરો.',
        loadFailed: 'ગ્રાહકો ખોલી શકાયા નથી. ફરી પ્રયત્ન કરો.',
      },
    },
    backup: {
      title: 'બેકઅપ',
      description: 'તમારી દુકાનનો બધો ડેટા એક ફાઇલમાં સાચવો. આ ફાઇલ સુરક્ષિત જગ્યાએ રાખો.',
      button: 'હમણાં બેકઅપ લો',
      working: 'બેકઅપ સાચવાય છે…',
      share: 'બેકઅપ ફાઇલ મોકલો',
      lastBackup: 'છેલ્લું બેકઅપ: {date}',
      never: 'આ ડિવાઇસ પર હજી બેકઅપ લીધું નથી.',
      doneTitle: 'બેકઅપ ફાઇલ બની ગઈ.',
      doneCount: '{count} રેકોર્ડ સાચવ્યા.',
      doneHint: 'ફાઇલ ક્યાં સાચવવી તે તમારો ફોન કે બ્રાઉઝર નક્કી કરે છે (સામાન્ય રીતે ડાઉનલોડ્સ). તેને સુરક્ષિત જગ્યાએ કૉપી કરો.',
      empty: 'બેકઅપ લેવા માટે હજી દુકાનનો કોઈ ડેટા નથી.',
      unsupported: 'આ ડિવાઇસ એપમાંથી ફાઇલ સાચવી શકતું નથી. તમારો ડેટા સુરક્ષિત અને બદલાયા વગરનો છે.',
      error: 'બેકઅપ નિષ્ફળ ગયું. તમારો ડેટા સુરક્ષિત અને બદલાયા વગરનો છે. ફરી પ્રયત્ન કરો.',
      restoreNote: 'આ ફક્ત નકલ સાચવે છે. બેકઅપમાંથી પાછો મેળવવાની સુવિધા હજી નથી.',
    },
    reports: {
      title: 'રિપોર્ટ',
      back: 'પાછા જાઓ',
      dateLabel: 'રિપોર્ટની તારીખ',
      todayButton: 'આજે',
      loading: 'લોડ થઈ રહ્યું છે...',
      retry: 'ફરી પ્રયત્ન કરો',
      heading: '{date} નો રિપોર્ટ',
      figures: {
        totalSales: 'કુલ વેચાણ',
        salesCount: '{count} વેચાણ',
        cashSales: 'રોકડ વેચાણ',
        cashHint: 'ઉધાર નહીં એવું વેચાણ',
        creditSales: 'ઉધાર વેચાણ',
        creditHint: 'ઉધારમાં વેચ્યું. પૈસા હજુ મળ્યા નથી.',
        totalPurchases: 'કુલ ખરીદી',
        purchasesCount: '{count} ખરીદી',
        payments: 'ગ્રાહકો પાસેથી મળેલી ચુકવણી',
        paymentsHint: 'ગ્રાહકો પાસેથી મળેલા પૈસા. તે વેચાણમાં ગણાતા નથી.',
        paymentsCount: '{count} ચુકવણી',
      },
      profit: {
        title: 'અંદાજિત કુલ નફો',
        estimateNote: 'વેચાણની રકમમાંથી વેચેલા માલની નોંધેલી ખરીદ કિંમત બાદ. આ ફક્ત અંદાજ છે.',
        noSales: 'આ તારીખે કોઈ વેચાણ નથી, તેથી નફો બતાવવાનો નથી.',
        completeNote: 'વેચેલા દરેક માલની નોંધેલી ખરીદ કિંમત પરથી ગણેલો.',
        incompleteTitle: 'અધૂરો - આના પર આધાર ન રાખો',
        incompleteText:
          '{count} વેચેલા માલની ખરીદ કિંમત નોંધેલી નથી, તેથી {amount} નું વેચાણ ગણતરીમાં નથી. ઉપરનો નફો ફક્ત જેની કિંમત ખબર છે તે માલનો છે. તે દિવસનો પૂરો નફો નથી.',
        knownLabel: 'કિંમત ખબર હોય તે માલ પરનો નફો',
        unavailableTitle: 'નફો ઉપલબ્ધ નથી',
        unavailableText:
          'વેચેલા કોઈ પણ માલની ખરીદ કિંમત નોંધેલી નથી. નફો જોવા માટે ખરીદીમાં તમારી ખરીદી નોંધો.',
        missingItems: 'કિંમત વગરનો માલ: {names}',
        andMore: 'અને બીજા {count}',
      },
      owed: {
        title: 'ગ્રાહકો પાસે તમારા લેવાના (હાલ)',
        none: 'કોઈ ગ્રાહક પાસે લેવાના બાકી નથી.',
        customers: '{count} ગ્રાહકની બાકી રકમ છે',
        nowNote: 'આ આજની બાકી રકમ છે, તમે પસંદ કરેલી તારીખની નથી.',
      },
      lists: {
        salesTitle: 'આ તારીખનું વેચાણ',
        noSales: 'આ તારીખે કોઈ વેચાણ નથી.',
        purchasesTitle: 'આ તારીખની ખરીદી',
        noPurchases: 'આ તારીખે કોઈ ખરીદી નથી.',
        walkIn: 'ગ્રાહકનું નામ નથી',
        noSupplier: 'સપ્લાયરનું નામ નથી',
        creditTag: 'ઉધાર',
        itemsCount: '{count} વસ્તુ',
      },
      about: {
        title: 'આ આંકડા વિશે',
        cash: 'રોકડ વેચાણ એટલે ગ્રાહકના ઉધારમાં ન મૂકેલું દરેક વેચાણ. ઉધાર નોંધણી શરૂ થઈ તે પહેલાંનું વેચાણ પણ અહીં ગણાય છે.',
        payments: 'ગ્રાહકની ચુકવણી એટલે મળેલા પૈસા. તે અલગ બતાવાય છે અને નવું વેચાણ ગણાતું નથી.',
        profit: 'નફો દરેક વેચાણ પહેલાં નોંધેલી છેલ્લી ખરીદ કિંમતથી ગણાય છે. કોઈ માલની ખરીદી નોંધેલી ન હોય તો તેનો નફો બાકાત રખાય છે અને સ્પષ્ટ દર્શાવાય છે.',
        notAccounting: 'આ રોજનો સાદો સારાંશ છે. તે હિસાબી કે ટેક્સ રિપોર્ટ નથી.',
      },
      errors: {
        loadFailed: 'રિપોર્ટ ખોલી શકાયો નથી. ફરી પ્રયત્ન કરો.',
      },
    },
  },
};
