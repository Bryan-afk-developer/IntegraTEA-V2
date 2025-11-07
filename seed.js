// seed.js - Script de Creación e Inserción para MongoDB (con Mongoose)
// Este script simula las funcionalidades de CREATE DATABASE, CREATE TABLE y INSERT INTO
// en un entorno NoSQL como MongoDB, utilizando los modelos Mongoose.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 

// Cargar variables de entorno
dotenv.config();

// Importar modelos de Mongoose
const Educator = require('./server/models/Educator');
const Child = require('./server/models/Child');
const Pictogram = require('./server/models/Pictogram');
const Activity = require('./server/models/Activity');

// Contraseña base para los educadores de prueba
const TEST_PASSWORD_PLAINTEXT = 'password123';

// --- FUNCIÓN CORREGIDA ---
// Usa el parámetro 'sig' para obtener una imagen única y evitar el caché/bloqueo de Unsplash
function getUnsplashImageUrl(keyword, width = 150, height = 150) {
  // Genera un valor aleatorio (seed) para la URL
  const randomSeed = Math.floor(Math.random() * 100000);
  // Utilizamos el parámetro "sig" (signature) en source.unsplash.com
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}&sig=${randomSeed}`;
}

const runSeedScript = async () => {
  try {
    console.log("--- INICIANDO SCRIPT DE POBLACIÓN DE DATOS DE INTEGRATEA ---");

    // 1. Conectar a la base de datos
    console.log("Intentando conectar a MongoDB con URI:", process.env.MONGO_URI);
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI no encontrada. Asegúrate de que tu archivo .env está en la raíz del proyecto.");
        return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ ¡Conexión a MongoDB exitosa!");

    // 2. Limpiar colecciones existentes para evitar duplicados y empezar de cero
    console.log("\n==> Limpiando colecciones existentes...");
    await Educator.deleteMany({});
    await Child.deleteMany({});
    await Pictogram.deleteMany({});
    await Activity.deleteMany({});
    console.log("✅ Colecciones limpiadas.");

    // 3. Generar y poblar datos de prueba

    // == EDUCADORES (1000) ==
    console.log("\n==> Generando y poblando 1000 Educadores...");
    const schools = ['CAM Sur Mérida', 'USAER 23', 'Instituto Kumen', 'Centro ASTRA', 'Escuela Modelo'];
    const educatorIds = []; 

    for (let i = 1; i <= 300; i++) {
        const firstNames = ['Ana', 'Luisa', 'Carlos', 'Javier', 'Mariana', 'Sofía', 'Pedro', 'Gabriela', 'Diego', 'Valeria'];
        const lastNames = ['Pérez', 'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Sánchez'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const newEducator = new Educator({
            firstName: firstName,
            lastName: lastName,
            email: `educador${i}@${schools[i % schools.length].toLowerCase().replace(/\s/g, '')}.edu.mx`,
            password: TEST_PASSWORD_PLAINTEXT, 
            school: schools[i % schools.length],
            createdAt: new Date()
        });
        
        await newEducator.save();
        educatorIds.push(newEducator._id); 
    }
    console.log(`✅ Insertados ${educatorIds.length} educadores con contraseñas hasheadas.`);

    // == NIÑOS (1000) ==
    console.log("\n==> Generando y poblando 1000 Niños...");
    const childrenData = []; 
    const childrenIds = [];

    for (let i = 0; i < 300; i++) {
        const firstNames = ['Mateo', 'CARLOS', 'Valentina', 'Santiago', 'Camila', 'Leo', 'Isabella', 'Thiago', 'Regina', 'Sebastián', 'Emilia'];
        const lastNames = ['Chan', 'Pech','RIVAS', 'Canul', 'May', 'Ucan', 'Herrera', 'Ciau', 'Ek'];
        const educatorIdForChild = educatorIds[i % educatorIds.length]; 
        
        const newChild = new Child({
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            age: Math.floor(Math.random() * (10 - 4 + 1)) + 4, 
            educatorId: educatorIdForChild,
            createdAt: new Date()
        });
        await newChild.save();
        childrenIds.push(newChild._id);
        childrenData.push(newChild); 
    }
    console.log(`✅ Insertados ${childrenIds.length} niños.`);

    // == PICTOGRAMAS (1000) ==
    console.log("\n==> Generando y poblando Pictogramas...");
    const pictogramList = [
        { name: 'Perro', category: 'Animales' }, { name: 'Gato', category: 'Animales' }, { name: 'Pájaro', category: 'Animales' }, { name: 'Pez', category: 'Animales' }, { name: 'León', category: 'Animales' },
        { name: 'Manzana', category: 'Comida' }, { name: 'Plátano', category: 'Comida' }, { name: 'Agua', category: 'Comida' }, { name: 'Pan', category: 'Comida' }, { name: 'Leche', category: 'Comida' },
        { name: 'Casa', category: 'Lugares' }, { name: 'Escuela', category: 'Lugares' }, { name: 'Parque', category: 'Lugares' }, { name: 'Baño', category: 'Lugares' }, { name: 'Tienda', category: 'Lugares' },
        { name: 'Pelota', category: 'Objetos' }, { name: 'Libro', category: 'Objetos' }, { name: 'Silla', category: 'Objetos' }, { name: 'Mesa', category: 'Objetos' }, { name: 'Cama', category: 'Objetos' },
        { name: 'Correr', category: 'Acciones' }, { name: 'Comer', category: 'Acciones' }, { name: 'Dormir', category: 'Acciones' }, { name: 'Jugar', category: 'Acciones' }, { name: 'Beber', category: 'Acciones' },
        { name: 'Mamá', category: 'Personas' }, { name: 'Papá', category: 'Personas' }, { name: 'Maestra', category: 'Personas' }, { name: 'Doctor', category: 'Personas' }, { name: 'Amigo', category: 'Personas' },
        { name: 'Feliz', category: 'Emociones' }, { name: 'Triste', category: 'Emociones' }, { name: 'Enojado', category: 'Emociones' }, { name: 'Sorprendido', category: 'Emociones' }, { name: 'Cansado', category: 'Emociones' },
        { name: 'Sol', category: 'Naturaleza' }, { name: 'Luna', category: 'Naturaleza' }, { name: 'Estrella', category: 'Naturaleza' }, { name: 'Árbol', category: 'Naturaleza' }, { name: 'Flor', category: 'Naturaleza' },
        { name: 'Coche', category: 'Transporte' }, { name: 'Autobús', category: 'Transporte' }, { name: 'Avión', category: 'Transporte' }, { name: 'Bicicleta', category: 'Transporte' }, { name: 'Barco', category: 'Transporte' },
        { name: 'Tren', category: 'Transporte' },
        { name: 'Libreta', category: 'Objetos' },
        { name: 'Lápiz', category: 'Objetos' },
        { name: 'Teléfono', category: 'Objetos' },
        { name: 'Ordenador', category: 'Objetos' }
    ]; 

    const pictogramsDataToInsert = pictogramList.map(p => ({
        ...p,
        imageUrl: getUnsplashImageUrl(p.name), 
        createdAt: new Date()
    }));

    // Añadir 950 pictogramas genéricos para llegar a 1000
    console.log("... Generando 950 pictogramas genéricos adicionales con imágenes...");
    const genericKeywords = ['objeto', 'persona', 'lugar', 'verbo', 'comida', 'animal', 'abstract', 'dibujo'];
    
    for (let i = 1; i <= 450; i++) {
        const name = `Pictograma ${i}`;
        const keyword = genericKeywords[i % genericKeywords.length]; 
        pictogramsDataToInsert.push({
            name: name,
            category: 'Genérico',
            imageUrl: getUnsplashImageUrl(keyword), 
            createdAt: new Date()
        });
    }

    const pictogramDocs = await Pictogram.insertMany(pictogramsDataToInsert); 
    const pictogramIds = pictogramDocs.map(doc => doc._id);
    console.log(`✅ Insertados ${pictogramIds.length} pictogramas (50 específicos + 950 genéricos).`);


    // == ACTIVIDADES (1000) ==
    console.log("\n==> Generando y poblando 1000 Actividades...");
    const activitiesData = [];
    
    for (let i = 0; i < Math.min(1000, childrenIds.length); i++) {
        const childId = childrenIds[i];
        const educatorId = childrenData[i].educatorId; 
        
        const isCompleted = Math.random() > 0.5;
        
        const numPictosForActivity = Math.min(6, pictogramIds.length);
        const randomPictos = [...pictogramIds].sort(() => 0.5 - Math.random()).slice(0, numPictosForActivity);

        const activity = {
            childId: childId,
            educatorId: educatorId,
            pictogramIds: randomPictos,
            status: isCompleted ? 'completada' : 'asignada',
            createdAt: new Date()
        };
        if (isCompleted) {
            activity.score = Math.floor(Math.random() * (100 - 60 + 1)) + 60; 
            activity.completedAt = new Date();
        }
        activitiesData.push(activity);
    }
    await Activity.insertMany(activitiesData); 
    console.log(`✅ Insertadas ${activitiesData.length} actividades.`);


    console.log("\n==================================================");
    console.log("Script de poblamiento de datos (1000 registros) finalizado con éxito.");
   console.log("==================================================");

  } catch (error) {
    console.error("\n❌ ERROR GRAVE EN EL SCRIPT DE POBLAMIENTO:");
    console.error(error);
  } finally {
    // 4. Desconectar de la base de datos
    await mongoose.disconnect();
    console.log("\n--- Conexión a MongoDB cerrada ---");
 }
};

runSeedScript();