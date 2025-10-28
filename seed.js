// seed.js - Script de Creación e Inserción para MongoDB (con Mongoose)
// Este script simula las funcionalidades de CREATE DATABASE, CREATE TABLE y INSERT INTO
// en un entorno NoSQL como MongoDB, utilizando los modelos Mongoose.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Necesario para hashear contraseñas si no usamos el hook 'pre'

// Cargar variables de entorno
// NOTA: Asegúrate de que tu .env esté en la raíz del proyecto
dotenv.config();

// Importar modelos de Mongoose
// Asegúrate de que las rutas a tus modelos sean correctas
const Educator = require('./server/models/Educator');
const Child = require('./server/models/Child');
const Pictogram = require('./server/models/Pictogram');
const Activity = require('./server/models/Activity');

// Contraseña base para los educadores de prueba
const TEST_PASSWORD_PLAINTEXT = 'password123';

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
    const educatorIds = []; // Para almacenar los _id de los educadores creados

    // CAMBIO: Bucle incrementado a 1000
    for (let i = 1; i <= 1000; i++) {
        const firstNames = ['Ana', 'Luisa', 'Carlos', 'Javier', 'Mariana', 'Sofía', 'Pedro', 'Gabriela', 'Diego', 'Valeria'];
        const lastNames = ['Pérez', 'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Sánchez'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const newEducator = new Educator({
            firstName: firstName,
            lastName: lastName,
            email: `educador${i}@${schools[i % schools.length].toLowerCase().replace(/\s/g, '')}.edu.mx`,
            password: TEST_PASSWORD_PLAINTEXT, // La contraseña se hasheará automáticamente al llamar a .save()
            school: schools[i % schools.length],
            createdAt: new Date()
        });
        
        await newEducator.save();
        educatorIds.push(newEducator._id); // Guardar el ID del educador creado
    }
    console.log(`✅ Insertados ${educatorIds.length} educadores con contraseñas hasheadas.`);

    // == NIÑOS (1000) ==
    console.log("\n==> Generando y poblando 1000 Niños...");
    const childrenData = []; // Guardar los objetos completos de niños para referenciar su educadorId
    const childrenIds = [];

    // CAMBIO: Bucle incrementado a 1000
    for (let i = 0; i < 1000; i++) {
        const firstNames = ['Mateo', 'CARLOS', 'Valentina', 'Santiago', 'Camila', 'Leo', 'Isabella', 'Thiago', 'Regina', 'Sebastián', 'Emilia'];

        const lastNames = ['Chan', 'Pech','RIVAS', 'Canul', 'May', 'Ucan', 'Herrera', 'Ciau', 'Ek'];
        const educatorIdForChild = educatorIds[i % educatorIds.length]; // Asignar un educador de la lista
        
        const newChild = new Child({
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            age: Math.floor(Math.random() * (10 - 4 + 1)) + 4, // Edades entre 4 y 10
            educatorId: educatorIdForChild,
            createdAt: new Date()
        });
        await newChild.save();
        childrenIds.push(newChild._id);
        childrenData.push(newChild); // Guardar el objeto del niño completo
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
    ]; // Esta lista tiene 50 pictogramas

    const pictogramsDataToInsert = pictogramList.map(p => ({
        ...p,
        imageUrl: p.imageUrl || `https://placehold.co/150x150/EEE/31343C?text=${encodeURIComponent(p.name)}`,
        createdAt: new Date()
    }));

    // CAMBIO: Añadir 950 pictogramas genéricos para llegar a 1000
    console.log("... Generando 950 pictogramas genéricos adicionales...");
    const genericCategories = ['Genérico', 'Verbos', 'Adjetivos', 'Lugares (Genérico)', 'Comida (Genérico)'];
    for (let i = 1; i <= 950; i++) {
        const name = `Pictograma ${i}`;
        const category = genericCategories[i % genericCategories.length];
        pictogramsDataToInsert.push({
            name: name,
            category: category,
            imageUrl: `https://placehold.co/150x150/EEE/31343C?text=${encodeURIComponent(name)}`,
            createdAt: new Date()
        });
    }

    const pictogramDocs = await Pictogram.insertMany(pictogramsDataToInsert); // Usar insertMany para eficiencia
    const pictogramIds = pictogramDocs.map(doc => doc._id);
    console.log(`✅ Insertados ${pictogramIds.length} pictogramas (50 específicos + 950 genéricos).`);


    // == ACTIVIDADES (1000) ==
    console.log("\n==> Generando y poblando 1000 Actividades...");
    const activitiesData = [];
    
    // CAMBIO: Bucle incrementado a 1000
    for (let i = 0; i < Math.min(1000, childrenIds.length); i++) {
        const childId = childrenIds[i];
        // Asegurarse de que el educadorId provenga del objeto del niño si lo guardamos
        const educatorId = childrenData[i].educatorId; 
        
        const isCompleted = Math.random() > 0.5;
        
        // Seleccionar 6 pictogramas al azar para el juego (asegurarse de tener suficientes, min 6)
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
            activity.score = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Puntuación entre 60 y 100
            activity.completedAt = new Date();
        }
        activitiesData.push(activity);
    }
    await Activity.insertMany(activitiesData); // Usar insertMany para eficiencia
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

