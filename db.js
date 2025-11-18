// Инициализация базы данных
window.calculationDB = {
  db: null,
  dbName: 'ISIWCalculatorDB',
  dbVersion: 1,

  // Инициализация БД
  init: function() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Ошибка открытия БД:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('БД успешно открыта');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Создаем хранилище для расчетов
        if (!db.objectStoreNames.contains('calculations')) {
          const calculationsStore = db.createObjectStore('calculations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          calculationsStore.createIndex('timestamp', 'timestamp', { unique: false });
          calculationsStore.createIndex('name', 'name', { unique: false });
        }

        // Создаем хранилище для изображений
        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { 
            keyPath: 'calculationId' 
          });
        }

        console.log('Структура БД создана');
      };
    });
  },

  // Сохранение расчета
  saveCalculation: function(calculationData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['calculations'], 'readwrite');
      const store = transaction.objectStore('calculations');
      
      const request = store.put(calculationData);
      
      request.onsuccess = () => {
        console.log('Расчет сохранен с ID:', request.result);
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Ошибка сохранения:', request.error);
        reject(request.error);
      };
    });
  },

  // Получение всех расчетов
  getAllCalculations: function() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['calculations'], 'readonly');
      const store = transaction.objectStore('calculations');
      const index = store.index('timestamp');
      
      const request = index.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Ошибка получения расчетов:', request.error);
        reject(request.error);
      };
    });
  },

  // Удаление расчета
  deleteCalculation: function(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['calculations', 'images'], 'readwrite');
      const calculationsStore = transaction.objectStore('calculations');
      const imagesStore = transaction.objectStore('images');
      
      // Удаляем расчет
      const calcRequest = calculationsStore.delete(id);
      
      // Удаляем связанное изображение
      const imgRequest = imagesStore.delete(id);
      
      transaction.oncomplete = () => {
        console.log('Расчет удален:', id);
        resolve(true);
      };
      
      transaction.onerror = () => {
        console.error('Ошибка удаления:', transaction.error);
        reject(transaction.error);
      };
    });
  },

  // Сохранение изображения
  saveImage: function(calculationId, imageData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const request = store.put({
        calculationId: calculationId,
        imageData: imageData,
        timestamp: new Date().toISOString()
      });
      
      request.onsuccess = () => {
        console.log('Изображение сохранено для расчета:', calculationId);
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Ошибка сохранения изображения:', request.error);
        reject(request.error);
      };
    });
  },

  // Получение изображения
  getImage: function(calculationId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      const request = store.get(calculationId);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Ошибка получения изображения:', request.error);
        reject(request.error);
      };
    });
  }
};