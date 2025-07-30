export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "business"
    | "creative"
    | "academic"
    | "personal"
    | "technical"
    | "health"
    | "education"
    | "social"
    | "productivity"
    | "finance";
  modes: {
    professional: string;
    casual: string;
    formal?: string;
    creative?: string;
  };
  tags: string[];
  complexity: "basic" | "intermediate" | "advanced";
  estimatedTime: string;
  tips: string[];
}

export const messageTemplates: MessageTemplate[] = [
  // Business
  {
    id: "business-email",
    name: "Email profesional",
    description: "Estructura para emails de trabajo con múltiples tonos",
    category: "business",
    modes: {
      professional: `Asunto: [Asunto claro y específico]

Estimado/a [Nombre del destinatario],

Espero que este mensaje le encuentre bien. Le escribo para [propósito específico del email].

[Desarrollo del mensaje con contexto y detalles relevantes]

[Si es necesario, incluir información adicional o preguntas específicas]

Quedo a la espera de su respuesta y estoy disponible para cualquier consulta adicional que pueda tener.

Saludos cordiales,

[Tu nombre completo]
[Cargo]
[Empresa]
[Teléfono]
[Email]`,
      casual: `Asunto: [Asunto directo]

¡Hola [Nombre]!

Espero que estés bien. Te escribo para [propósito del email].

[Desarrollo del mensaje de manera amigable]

[Si necesitas algo más, no dudes en preguntar]

¡Gracias por tu tiempo!

Saludos,
[Tu nombre]`,
      formal: `Asunto: [Asunto formal y descriptivo]

Estimado/a [Título] [Apellido],

Me dirijo a usted para [propósito formal del email].

[Desarrollo detallado del mensaje con lenguaje formal]

[Información adicional si es necesaria]

Agradezco de antemano su atención y quedo a la espera de su respuesta.

Atentamente,

[Tu nombre completo]
[Cargo]
[Departamento]
[Empresa]
[Información de contacto completa]`,
      creative: `Asunto: [Asunto creativo y llamativo]

¡Hola [Nombre]! 👋

Espero que este mensaje te encuentre con energía y buenas vibras. Te escribo porque [propósito creativo del email].

[Desarrollo del mensaje con un toque personal y creativo]

[Si tienes alguna idea o sugerencia, ¡me encantaría escucharla!]

¡Gracias por tu tiempo y espero conectar pronto!

Saludos creativos,
[Tu nombre] ✨`
    },
    tags: ["email", "profesional", "trabajo", "comunicación"],
    complexity: "intermediate",
    estimatedTime: "10-15 minutos",
    tips: [
      "Personaliza el saludo según el nivel de formalidad",
      "Sé específico en el propósito del email",
      "Mantén un tono profesional pero accesible",
      "Incluye una llamada a la acción clara",
      "Revisa la ortografía y gramática antes de enviar"
    ],
  },
  {
    id: "meeting-agenda",
    name: "Agenda de reunión",
    description: "Estructura para agendas de reuniones con diferentes estilos",
    category: "business",
    modes: {
      professional: `AGENDA DE REUNIÓN

Título: [Título de la reunión]
Fecha: [Fecha completa]
Hora: [Hora de inicio] - [Hora de finalización]
Lugar: [Ubicación física o virtual]
Participantes: [Lista de asistentes]

OBJETIVOS DE LA REUNIÓN:
• [Objetivo principal]
• [Objetivo secundario]
• [Objetivo adicional]

PUNTOS A TRATAR:

1. [Punto 1] - [Responsable] - [Tiempo estimado]
   • [Subpunto 1.1]
   • [Subpunto 1.2]

2. [Punto 2] - [Responsable] - [Tiempo estimado]
   • [Subpunto 2.1]
   • [Subpunto 2.2]

3. [Punto 3] - [Responsable] - [Tiempo estimado]
   • [Subpunto 3.1]
   • [Subpunto 3.2]

MATERIALES NECESARIOS:
• [Material 1]
• [Material 2]
• [Material 3]

PRÓXIMOS PASOS:
• [Acción 1] - [Responsable] - [Fecha límite]
• [Acción 2] - [Responsable] - [Fecha límite]
• [Acción 3] - [Responsable] - [Fecha límite]

NOTAS ADICIONALES:
[Información relevante para la reunión]`,
      casual: `📅 AGENDA DE REUNIÓN

🎯 Título: [Título de la reunión]
📆 Fecha: [Fecha]
⏰ Hora: [Hora]
📍 Lugar: [Ubicación]
👥 Participantes: [Lista de personas]

🎯 ¿Qué queremos lograr?
• [Objetivo 1]
• [Objetivo 2]

📋 Temas a tratar:

1️⃣ [Tema 1] - [Quién] - [Cuánto tiempo]
   • [Punto importante]
   • [Otro punto]

2️⃣ [Tema 2] - [Quién] - [Cuánto tiempo]
   • [Punto importante]
   • [Otro punto]

3️⃣ [Tema 3] - [Quién] - [Cuánto tiempo]
   • [Punto importante]
   • [Otro punto]

📚 ¿Qué necesitamos?
• [Material 1]
• [Material 2]

✅ Próximos pasos:
• [Acción 1] - [Quién] - [Cuándo]
• [Acción 2] - [Quién] - [Cuándo]

💡 Notas:
[Algo importante que recordar]`,
      formal: `ACTA DE AGENDA DE REUNIÓN

INFORMACIÓN GENERAL:
Título de la reunión: [Título oficial]
Fecha de celebración: [Fecha completa]
Horario: [Hora de inicio] - [Hora de finalización]
Modalidad: [Presencial/Virtual/Híbrida]
Ubicación: [Dirección completa o plataforma virtual]
Convocante: [Nombre y cargo del convocante]

LISTA DE PARTICIPANTES:
• [Nombre completo] - [Cargo] - [Departamento]
• [Nombre completo] - [Cargo] - [Departamento]
• [Nombre completo] - [Cargo] - [Departamento]

OBJETIVOS ESTRATÉGICOS:
1. [Objetivo principal con descripción detallada]
2. [Objetivo secundario con descripción detallada]
3. [Objetivo adicional con descripción detallada]

ORDEN DEL DÍA:

PUNTO 1: [Título del punto]
Responsable: [Nombre y cargo]
Duración estimada: [Tiempo]
Contenido:
   • [Subpunto 1.1 con descripción]
   • [Subpunto 1.2 con descripción]
   • [Subpunto 1.3 con descripción]

PUNTO 2: [Título del punto]
Responsable: [Nombre y cargo]
Duración estimada: [Tiempo]
Contenido:
   • [Subpunto 2.1 con descripción]
   • [Subpunto 2.2 con descripción]
   • [Subpunto 2.3 con descripción]

PUNTO 3: [Título del punto]
Responsable: [Nombre y cargo]
Duración estimada: [Tiempo]
Contenido:
   • [Subpunto 3.1 con descripción]
   • [Subpunto 3.2 con descripción]
   • [Subpunto 3.3 con descripción]

RECURSOS Y MATERIALES REQUERIDOS:
• [Material 1] - [Especificación técnica]
• [Material 2] - [Especificación técnica]
• [Material 3] - [Especificación técnica]

ACUERDOS Y COMPROMISOS:
• [Acuerdo 1] - [Responsable] - [Fecha de cumplimiento]
• [Acuerdo 2] - [Responsable] - [Fecha de cumplimiento]
• [Acuerdo 3] - [Responsable] - [Fecha de cumplimiento]

OBSERVACIONES Y CONSIDERACIONES:
[Información adicional relevante para el desarrollo de la reunión]`,
      creative: `🌟 AGENDA DE REUNIÓN CREATIVA

✨ Título: [Título inspirador]
📅 Fecha: [Fecha]
⏰ Hora: [Hora]
📍 Lugar: [Ubicación]
👥 Equipo: [Lista de participantes]

🎯 Nuestra misión:
• [Objetivo inspirador 1]
• [Objetivo inspirador 2]

🚀 Temas que vamos a explorar:

1️⃣ [Tema 1] - [Líder] - [Tiempo]
   • 💡 [Idea principal]
   • ✨ [Punto creativo]

2️⃣ [Tema 2] - [Líder] - [Tiempo]
   • 💡 [Idea principal]
   • ✨ [Punto creativo]

3️⃣ [Tema 3] - [Líder] - [Tiempo]
   • 💡 [Idea principal]
   • ✨ [Punto creativo]

🎨 Herramientas que necesitamos:
• [Herramienta 1]
• [Herramienta 2]

🎯 Acciones que vamos a tomar:
• [Acción 1] - [Responsable] - [Cuándo]
• [Acción 2] - [Responsable] - [Cuándo]

💫 Notas especiales:
[Algo que nos inspire para la reunión]`
    },
    tags: ["reunión", "agenda", "trabajo", "organización"],
    complexity: "intermediate",
    estimatedTime: "15-20 minutos",
    tips: [
      "Asigna tiempos específicos a cada punto",
      "Identifica claramente los responsables",
      "Incluye materiales necesarios con anticipación",
      "Define objetivos SMART",
      "Deja tiempo para preguntas y discusión"
    ],
  },
  {
    id: "project-proposal",
    name: "Propuesta de proyecto",
    description: "Estructura para propuestas de proyectos",
    category: "business",
    content:
      "PROPUESTA DE PROYECTO\n\nTítulo: [Nombre del proyecto]\n\nResumen ejecutivo:\n[Descripción breve del proyecto]\n\nObjetivos:\n- [Objetivo 1]\n- [Objetivo 2]\n- [Objetivo 3]\n\nAlcance:\n[Descripción detallada del alcance]\n\nCronograma:\n- Fase 1: [Descripción] - [Duración]\n- Fase 2: [Descripción] - [Duración]\n- Fase 3: [Descripción] - [Duración]\n\nPresupuesto:\n[Detalle del presupuesto]\n\nBeneficios esperados:\n- [Beneficio 1]\n- [Beneficio 2]",
    tags: ["proyecto", "propuesta", "negocio"],
  },
  {
    id: "cv-template",
    name: "Curriculum Vitae",
    description: "Plantilla profesional para CV con múltiples estilos",
    category: "business",
    modes: {
      professional: `CURRICULUM VITAE

[Tu nombre completo]
[Email profesional] | [Teléfono] | [LinkedIn] | [Portfolio/Website]

PERFIL PROFESIONAL
Profesional [X] años de experiencia en [área principal], especializado en [especialización]. Demostrada capacidad para [logro principal] y [logro secundario]. Apasionado por [interés profesional] y comprometido con [valor profesional].

EXPERIENCIA LABORAL

[Empresa actual] - [Cargo actual]
[Fecha inicio] - Presente
• Lideré [proyecto/equipo] que resultó en [resultado cuantificable]
• Desarrollé e implementé [estrategia/proceso] que mejoró [métrica] en [X]%
• Colaboré con [departamentos/equipos] para [objetivo alcanzado]
• Gestioné presupuesto de [cantidad] para [tipo de proyecto]

[Empresa anterior] - [Cargo anterior]
[Fecha inicio] - [Fecha fin]
• Logré [resultado específico] mediante [acción específica]
• Optimicé [proceso/sistema] reduciendo [métrica] en [X]%
• Entrené y supervisé equipo de [X] personas
• Implementé [tecnología/método] que aumentó [eficiencia/productividad]

[Empresa anterior 2] - [Cargo anterior 2]
[Fecha inicio] - [Fecha fin]
• Contribuí al desarrollo de [producto/servicio] que generó [resultado]
• Participé en [proyecto] que [impacto en la empresa]
• Adquirí experiencia en [habilidad técnica específica]

EDUCACIÓN

[Universidad/Institución] - [Título obtenido]
[Fecha graduación] - [GPA si es relevante]
• Especialización: [Especialización si aplica]
• Proyecto destacado: [Descripción breve]
• Actividades extracurriculares: [Actividades relevantes]

HABILIDADES TÉCNICAS
• [Habilidad técnica 1]: [Nivel de experiencia]
• [Habilidad técnica 2]: [Nivel de experiencia]
• [Habilidad técnica 3]: [Nivel de experiencia]
• [Habilidad técnica 4]: [Nivel de experiencia]

HABILIDADES BLANDAS
• Liderazgo de equipos y gestión de proyectos
• Comunicación efectiva y presentaciones
• Resolución de problemas y pensamiento analítico
• Trabajo en equipo y colaboración interdepartamental

IDIOMAS
• [Idioma 1]: [Nivel - Nativo/Avanzado/Intermedio]
• [Idioma 2]: [Nivel - Nativo/Avanzado/Intermedio]

CERTIFICACIONES
• [Certificación 1] - [Institución] - [Fecha]
• [Certificación 2] - [Institución] - [Fecha]

PROYECTOS DESTACADOS
• [Proyecto 1]: [Descripción breve y resultados]
• [Proyecto 2]: [Descripción breve y resultados]

REFERENCIAS
Disponibles bajo solicitud.`,
      casual: `¡Hola! Soy [Tu nombre] 👋

Sobre mí:
Soy un [profesión] apasionado por [interés principal]. Me encanta [actividad relacionada] y siempre estoy buscando nuevos desafíos.

Lo que hago:
Actualmente trabajo en [empresa] como [cargo], donde me dedico a [descripción del trabajo]. Antes de esto, estuve en [empresa anterior] haciendo [trabajo anterior].

Mi experiencia incluye:
• [Logro/experiencia 1]
• [Logro/experiencia 2]
• [Logro/experiencia 3]

Educación:
Estudié [carrera] en [universidad] y me gradué en [año]. También he tomado cursos en [áreas de interés].

Lo que sé hacer:
• [Habilidad 1] ⚡
• [Habilidad 2] 🚀
• [Habilidad 3] 💡
• [Habilidad 4] 🎯

Idiomas:
• [Idioma 1] - [Nivel]
• [Idioma 2] - [Nivel]

Certificaciones:
• [Certificación 1]
• [Certificación 2]

Proyectos que me enorgullecen:
• [Proyecto 1] - [Resultado]
• [Proyecto 2] - [Resultado]

¿Quieres trabajar juntos? ¡Me encantaría charlar! 📧 [Email]`,
      formal: `CURRICULUM VITAE

INFORMACIÓN PERSONAL
Nombre completo: [Tu nombre completo]
Dirección: [Dirección completa]
Teléfono: [Teléfono]
Correo electrónico: [Email]
LinkedIn: [LinkedIn]
Sitio web: [Website si aplica]

PERFIL PROFESIONAL
Profesional con [X] años de experiencia en [área de especialización], caracterizado por [cualidad principal] y [cualidad secundaria]. Especializado en [especialización técnica] con demostrada capacidad para [logro principal]. Comprometido con la excelencia y la innovación en [sector/industria].

EXPERIENCIA PROFESIONAL

[Empresa actual]
Cargo: [Cargo actual]
Período: [Fecha inicio] - Presente
Responsabilidades principales:
• Dirigí [proyecto/equipo] que culminó en [resultado cuantificable]
• Diseñé e implementé [estrategia/proceso] que incrementó [métrica] en [X]%
• Coordiné esfuerzos entre [departamentos] para lograr [objetivo]
• Administré presupuesto de [cantidad] destinado a [tipo de proyecto]
• Establecí [proceso/estándar] que mejoró [eficiencia/calidad]

[Empresa anterior]
Cargo: [Cargo anterior]
Período: [Fecha inicio] - [Fecha fin]
Responsabilidades principales:
• Alcancé [resultado específico] a través de [acción específica]
• Optimicé [proceso/sistema] logrando reducción de [X]% en [métrica]
• Supervisé y capacité equipo de [X] profesionales
• Implementé [tecnología/método] que elevó [eficiencia/productividad] en [X]%

FORMACIÓN ACADÉMICA

[Universidad/Institución]
Título: [Título obtenido]
Período: [Fecha inicio] - [Fecha graduación]
Promedio: [GPA si es relevante]
Especialización: [Especialización si aplica]
Tesis/Proyecto: [Descripción del proyecto final]

COMPETENCIAS TÉCNICAS
• [Habilidad técnica 1]: [Nivel de dominio]
• [Habilidad técnica 2]: [Nivel de dominio]
• [Habilidad técnica 3]: [Nivel de dominio]
• [Habilidad técnica 4]: [Nivel de dominio]

COMPETENCIAS TRANSVERSALES
• Liderazgo estratégico y gestión de equipos
• Comunicación efectiva y presentaciones ejecutivas
• Análisis crítico y resolución de problemas complejos
• Colaboración interdisciplinaria y trabajo en equipo

DOMINIO LINGÜÍSTICO
• [Idioma 1]: [Nivel certificado]
• [Idioma 2]: [Nivel certificado]

CREDENCIALES PROFESIONALES
• [Certificación 1] - [Institución certificadora] - [Fecha de obtención]
• [Certificación 2] - [Institución certificadora] - [Fecha de obtención]

INICIATIVAS DESTACADAS
• [Proyecto 1]: [Descripción detallada y resultados obtenidos]
• [Proyecto 2]: [Descripción detallada y resultados obtenidos]

REFERENCIAS PROFESIONALES
Disponibles para verificación bajo solicitud formal.`,
      creative: `🎨 [Tu nombre] - [Profesión]

✨ SOBRE MÍ
Soy un [profesión] que ve el mundo a través de [perspectiva única]. Mi superpoder es [habilidad especial] y mi misión es [objetivo profesional].

🚀 MI VIAJE
Actualmente estoy en [empresa] creando [tipo de trabajo]. Antes de esto, exploré [empresa anterior] donde descubrí [aprendizaje].

🎯 LO QUE HE LOGRADO
• ✨ [Logro creativo 1]
• 🎨 [Logro creativo 2]
• 💫 [Logro creativo 3]

🎓 MI EDUCACIÓN
Estudié [carrera] en [universidad] - una aventura que me enseñó [lección importante].

🛠️ MI CAJA DE HERRAMIENTAS
• [Habilidad 1] 🎯
• [Habilidad 2] ⚡
• [Habilidad 3] 🚀
• [Habilidad 4] 💡

🌍 IDIOMAS
• [Idioma 1] - [Nivel]
• [Idioma 2] - [Nivel]

🏆 CERTIFICACIONES
• [Certificación 1] 🏅
• [Certificación 2] 🏅

🎨 PROYECTOS QUE ME ENORGULLECEN
• [Proyecto 1] - [Descripción creativa]
• [Proyecto 2] - [Descripción creativa]

💌 ¿QUIERES CONECTAR?
¡Me encantaría escuchar sobre tu proyecto! 📧 [Email]`,
    },
    tags: ["cv", "curriculum", "trabajo", "empleo", "profesional"],
    complexity: "advanced",
    estimatedTime: "30-45 minutos",
    tips: [
      "Personaliza cada versión según la empresa y el cargo",
      "Incluye métricas cuantificables en tus logros",
      "Adapta el tono al nivel de formalidad de la empresa",
      "Usa palabras clave relevantes para ATS",
      "Mantén consistencia en el formato elegido",
    ],
  },
  {
    id: "cover-letter",
    name: "Carta de presentación",
    description: "Plantilla para cartas de presentación",
    category: "business",
    content:
      "[Tu nombre]\n[Dirección]\n[Email]\n[Teléfono]\n\n[Fecha]\n\n[Empresa]\n[Dirección de la empresa]\n\nEstimado/a [Nombre del reclutador],\n\nMe dirijo a usted para expresar mi interés en la posición de [Cargo] en [Empresa].\n\nCon [X] años de experiencia en [área], he desarrollado habilidades en [habilidad 1], [habilidad 2] y [habilidad 3]. En mi posición actual en [empresa anterior], he logrado [logro específico].\n\nEstoy especialmente interesado en [Empresa] por [razón específica].\n\nAdjunto mi CV para su consideración. Quedo disponible para una entrevista en el momento que considere oportuno.\n\nSaludos cordiales,\n[Tu nombre]",
    tags: ["carta", "presentación", "empleo"],
  },

  // Health & Fitness
  {
    id: "exercise-routine",
    name: "Rutina de ejercicios",
    description: "Plan de entrenamiento completo con progresión",
    category: "health",
    modes: {
      professional: `PLAN DE ENTRENAMIENTO ESTRUCTURADO

INFORMACIÓN GENERAL
• Objetivo principal: [Objetivo específico]
• Nivel: [Principiante/Intermedio/Avanzado]
• Duración del programa: [X] semanas
• Frecuencia: [X] días por semana
• Tiempo por sesión: [X] minutos

EVALUACIÓN INICIAL
• Peso actual: [X] kg
• Objetivo de peso: [X] kg
• Medidas corporales: [Detalles]
• Nivel de condición física: [Evaluación]
• Lesiones/limitaciones: [Si aplica]

PROGRAMA SEMANAL

LUNES - ENTRENAMIENTO DE FUERZA (Pecho y Tríceps)
Calentamiento (10-15 min):
• Movilidad articular
• Cardio ligero: [Actividad] - 5 min
• Estiramientos dinámicos

Ejercicios principales:
1. Press de banca plano
   - Series: 4 | Repeticiones: 8-12 | Descanso: 2-3 min
   - Progresión: Aumentar peso cada 2 semanas
2. Press inclinado con mancuernas
   - Series: 3 | Repeticiones: 10-12 | Descanso: 2 min
3. Fondos en paralelas
   - Series: 3 | Repeticiones: 8-12 | Descanso: 2 min
4. Extensiones de tríceps en polea
   - Series: 3 | Repeticiones: 12-15 | Descanso: 1.5 min

MARTES - ENTRENAMIENTO DE FUERZA (Espalda y Bíceps)
Calentamiento (10-15 min):
• Movilidad articular
• Cardio ligero: [Actividad] - 5 min

Ejercicios principales:
1. Dominadas asistidas
   - Series: 4 | Repeticiones: 6-10 | Descanso: 2-3 min
2. Remo con barra
   - Series: 4 | Repeticiones: 8-12 | Descanso: 2 min
3. Remo con mancuernas
   - Series: 3 | Repeticiones: 10-12 | Descanso: 1.5 min
4. Curl de bíceps con barra
   - Series: 3 | Repeticiones: 10-12 | Descanso: 1.5 min

MIÉRCOLES - CARDIO Y CORE
Cardio (30-45 min):
• [Actividad cardio] - Intensidad moderada
• Intervalos: [Descripción si aplica]

Core:
1. Plancha frontal - 3 series x 60 seg
2. Plancha lateral - 3 series x 45 seg cada lado
3. Crunches - 3 series x 15-20 rep
4. Russian twists - 3 series x 20 rep

JUEVES - ENTRENAMIENTO DE FUERZA (Piernas)
Calentamiento (15 min):
• Movilidad específica para piernas
• Cardio ligero: [Actividad] - 5 min

Ejercicios principales:
1. Sentadillas con barra
   - Series: 4 | Repeticiones: 8-12 | Descanso: 3 min
2. Prensa de piernas
   - Series: 3 | Repeticiones: 10-12 | Descanso: 2 min
3. Extensiones de cuádriceps
   - Series: 3 | Repeticiones: 12-15 | Descanso: 1.5 min
4. Curl de isquiotibiales
   - Series: 3 | Repeticiones: 12-15 | Descanso: 1.5 min

VIERNES - ENTRENAMIENTO DE FUERZA (Hombros)
Calentamiento (10 min):
• Movilidad de hombros
• Rotaciones con bandas

Ejercicios principales:
1. Press militar
   - Series: 4 | Repeticiones: 8-12 | Descanso: 2-3 min
2. Elevaciones laterales
   - Series: 3 | Repeticiones: 12-15 | Descanso: 1.5 min
3. Elevaciones frontales
   - Series: 3 | Repeticiones: 12-15 | Descanso: 1.5 min
4. Face pulls
   - Series: 3 | Repeticiones: 15-20 | Descanso: 1 min

SÁBADO - CARDIO Y FLEXIBILIDAD
• Cardio: [Actividad] - 45-60 min
• Yoga/Estiramientos: 30 min
• Movilidad: 15 min

DOMINGO - DESCANSO ACTIVO
• Caminata ligera: 30 min
• Estiramientos suaves: 20 min
• Recuperación y preparación para la semana

NUTRICIÓN COMPLEMENTARIA
• Proteínas: [X]g por kg de peso corporal
• Carbohidratos: [X]g por kg de peso corporal
• Grasas: [X]g por kg de peso corporal
• Hidratación: [X] litros por día

SEGUIMIENTO Y PROGRESIÓN
• Medidas semanales: [Día específico]
• Peso: [Frecuencia de medición]
• Fotos de progreso: [Frecuencia]
• Ajustes del programa: [Cada cuánto tiempo]`,
      casual: `💪 MI RUTINA DE EJERCICIOS

🎯 OBJETIVO: [Lo que quiero lograr]
⏰ DURACIÓN: [Cuánto tiempo voy a entrenar]
📅 FRECUENCIA: [Cuántos días por semana]

LUNES - PECHO Y BRAZOS 💪
• Press de banca: 3 series x 10 rep
• Fondos: 3 series x 8 rep
• Extensiones de tríceps: 3 series x 12 rep
• ¡Descanso entre series: 2 min!

MARTES - ESPALDA Y BÍCEPS 🏋️
• Dominadas: 3 series x 6 rep (o lo que pueda)
• Remo con mancuernas: 3 series x 10 rep
• Curl de bíceps: 3 series x 12 rep
• ¡Me siento súper fuerte! 💪

MIÉRCOLES - CARDIO Y CORE 🏃‍♂️
• Correr: 30 min (o caminar rápido)
• Plancha: 3 series x 45 seg
• Crunches: 3 series x 15 rep
• ¡Me encanta el cardio! 🎵

JUEVES - PIERNAS 🦵
• Sentadillas: 3 series x 12 rep
• Prensa: 3 series x 10 rep
• Extensiones: 3 series x 15 rep
• ¡Las piernas me van a doler! 😅

VIERNES - HOMBROS Y CORE 🏋️
• Press militar: 3 series x 10 rep
• Elevaciones laterales: 3 series x 12 rep
• Plancha lateral: 3 series x 30 seg cada lado
• ¡Hombros de acero! 💪

SÁBADO - CARDIO DIVERTIDO 🎯
• [Actividad que me guste]: 45 min
• Estiramientos: 15 min
• ¡Día de diversión! 🎉

DOMINGO - DESCANSO 😴
• Caminata ligera: 20 min
• Estiramientos suaves
• ¡Recuperación total!

📊 SEGUIMIENTO:
• Peso: [Medir cada semana]
• Fotos: [Cada 2 semanas]
• Notas: [Cómo me siento]

💡 TIPS:
• ¡Hidratación es clave! 💧
• Descanso entre series: 1-2 min
• ¡Escuchar música motivacional! 🎵
• ¡No olvidar calentar siempre! 🔥`,
      formal: `PROGRAMA DE ENTRENAMIENTO FÍSICO ESTRUCTURADO

ESPECIFICACIONES DEL PROGRAMA
• Objetivo de entrenamiento: [Objetivo específico]
• Categoría de nivel: [Principiante/Intermedio/Avanzado]
• Período de implementación: [X] semanas
• Frecuencia de entrenamiento: [X] sesiones semanales
• Duración estimada por sesión: [X] minutos

EVALUACIÓN FÍSICA PREVIA
• Peso corporal actual: [X] kilogramos
• Objetivo de peso corporal: [X] kilogramos
• Composición corporal: [Porcentajes de grasa/músculo]
• Capacidad cardiovascular: [Evaluación específica]
• Flexibilidad y movilidad: [Evaluación]
• Historial médico relevante: [Si aplica]

DISTRIBUCIÓN SEMANAL DE ENTRENAMIENTO

DÍA 1 - ENTRENAMIENTO DE FUERZA SUPERIOR (Pecho y Tríceps)
Protocolo de calentamiento (15 minutos):
• Movilidad articular general
• Actividad cardiovascular ligera: [Especificar] - 5 minutos
• Estiramientos dinámicos específicos

Protocolo de entrenamiento principal:
1. Press de banca plano con barra
   - Volumen: 4 series | Intensidad: 8-12 repeticiones | Recuperación: 2-3 minutos
   - Progresión: Incremento de carga cada 2 semanas
2. Press inclinado con mancuernas
   - Volumen: 3 series | Intensidad: 10-12 repeticiones | Recuperación: 2 minutos
3. Fondos en paralelas
   - Volumen: 3 series | Intensidad: 8-12 repeticiones | Recuperación: 2 minutos
4. Extensiones de tríceps en polea alta
   - Volumen: 3 series | Intensidad: 12-15 repeticiones | Recuperación: 1.5 minutos

DÍA 2 - ENTRENAMIENTO DE FUERZA SUPERIOR (Espalda y Bíceps)
Protocolo de calentamiento (15 minutos):
• Movilidad articular específica
• Actividad cardiovascular ligera: [Especificar] - 5 minutos

Protocolo de entrenamiento principal:
1. Dominadas asistidas
   - Volumen: 4 series | Intensidad: 6-10 repeticiones | Recuperación: 2-3 minutos
2. Remo con barra en T
   - Volumen: 4 series | Intensidad: 8-12 repeticiones | Recuperación: 2 minutos
3. Remo con mancuernas unilateral
   - Volumen: 3 series | Intensidad: 10-12 repeticiones | Recuperación: 1.5 minutos
4. Curl de bíceps con barra recta
   - Volumen: 3 series | Intensidad: 10-12 repeticiones | Recuperación: 1.5 minutos

DÍA 3 - ENTRENAMIENTO CARDIOVASCULAR Y CORE
Componente cardiovascular (30-45 minutos):
• Modalidad: [Especificar actividad]
• Intensidad: Moderada (60-70% FC máx)
• Protocolo de intervalos: [Si aplica]

Componente de fortalecimiento core:
1. Plancha frontal isométrica - 3 series x 60 segundos
2. Plancha lateral isométrica - 3 series x 45 segundos por lado
3. Crunches abdominales - 3 series x 15-20 repeticiones
4. Russian twists con peso - 3 series x 20 repeticiones

DÍA 4 - ENTRENAMIENTO DE FUERZA INFERIOR
Protocolo de calentamiento (20 minutos):
• Movilidad específica para miembros inferiores
• Actividad cardiovascular ligera: [Especificar] - 5 minutos

Protocolo de entrenamiento principal:
1. Sentadillas con barra en espalda
   - Volumen: 4 series | Intensidad: 8-12 repeticiones | Recuperación: 3 minutos
2. Prensa de piernas horizontal
   - Volumen: 3 series | Intensidad: 10-12 repeticiones | Recuperación: 2 minutos
3. Extensiones de cuádriceps en máquina
   - Volumen: 3 series | Intensidad: 12-15 repeticiones | Recuperación: 1.5 minutos
4. Curl de isquiotibiales acostado
   - Volumen: 3 series | Intensidad: 12-15 repeticiones | Recuperación: 1.5 minutos

DÍA 5 - ENTRENAMIENTO DE FUERZA SUPERIOR (Hombros)
Protocolo de calentamiento (15 minutos):
• Movilidad específica de hombros
• Rotaciones con bandas elásticas

Protocolo de entrenamiento principal:
1. Press militar con barra
   - Volumen: 4 series | Intensidad: 8-12 repeticiones | Recuperación: 2-3 minutos
2. Elevaciones laterales con mancuernas
   - Volumen: 3 series | Intensidad: 12-15 repeticiones | Recuperación: 1.5 minutos
3. Elevaciones frontales con mancuernas
   - Volumen: 3 series | Intensidad: 12-15 repeticiones | Recuperación: 1.5 minutos
4. Face pulls con bandas
   - Volumen: 3 series | Intensidad: 15-20 repeticiones | Recuperación: 1 minuto

DÍA 6 - ENTRENAMIENTO CARDIOVASCULAR Y FLEXIBILIDAD
• Componente cardiovascular: [Actividad] - 45-60 minutos
• Componente de flexibilidad: Yoga/estiramientos - 30 minutos
• Componente de movilidad: 15 minutos

DÍA 7 - DESCANSO ACTIVO
• Actividad física ligera: Caminata - 30 minutos
• Estiramientos de mantenimiento: 20 minutos
• Recuperación y preparación para el siguiente ciclo

PROTOCOLO NUTRICIONAL COMPLEMENTARIO
• Requerimiento proteico: [X] gramos por kilogramo de peso corporal
• Requerimiento de carbohidratos: [X] gramos por kilogramo de peso corporal
• Requerimiento de grasas: [X] gramos por kilogramo de peso corporal
• Hidratación diaria: [X] litros de agua

SISTEMA DE MONITOREO Y PROGRESIÓN
• Evaluación antropométrica: Semanal
• Control de peso corporal: [Frecuencia específica]
• Documentación fotográfica: [Frecuencia]
• Ajustes programáticos: [Intervalo de tiempo]`,
      creative: `🌟 MI VIAJE DE TRANSFORMACIÓN FÍSICA

🎯 MI MISIÓN: [Lo que quiero lograr]
⏰ MI CRONOGRAMA: [Cuánto tiempo voy a dedicar]
📅 MI COMPROMISO: [Cuántos días por semana]

LUNES - DÍA DEL PODER SUPERIOR 💪
• Press de banca: 3 series x 10 rep (¡como un guerrero!)
• Fondos: 3 series x 8 rep (¡volando como un águila!)
• Extensiones de tríceps: 3 series x 12 rep (¡brazos de acero!)
• ¡Descanso épico entre series: 2 min!

MARTES - DÍA DE LA ESPALDA LEGENDARIA 🏋️
• Dominadas: 3 series x 6 rep (¡escalando hacia el éxito!)
• Remo con mancuernas: 3 series x 10 rep (¡remando hacia mis sueños!)
• Curl de bíceps: 3 series x 12 rep (¡brazos que inspiran!)
• ¡Me siento como un superhéroe! 🦸‍♂️

MIÉRCOLES - DÍA DEL CORAZÓN Y EL NÚCLEO 🏃‍♂️
• Correr: 30 min (¡corriendo hacia mis metas!)
• Plancha: 3 series x 45 seg (¡firme como una roca!)
• Crunches: 3 series x 15 rep (¡núcleo de diamante!)
• ¡El cardio me hace sentir vivo! ⚡

JUEVES - DÍA DE LAS PIERNAS TITÁNICAS 🦵
• Sentadillas: 3 series x 12 rep (¡poder de titán!)
• Prensa: 3 series x 10 rep (¡empujando mis límites!)
• Extensiones: 3 series x 15 rep (¡piernas que no se rinden!)
• ¡Las piernas me van a hacer volar! 🚀

VIERNES - DÍA DE LOS HOMBROS DE ACERO 🏋️
• Press militar: 3 series x 10 rep (¡cargando el mundo!)
• Elevaciones laterales: 3 series x 12 rep (¡alas de águila!)
• Plancha lateral: 3 series x 30 seg cada lado (¡equilibrio perfecto!)
• ¡Hombros que sostienen mis sueños! 💪

SÁBADO - DÍA DE LA LIBERTAD CARDIOVASCULAR 🎯
• [Mi actividad favorita]: 45 min (¡divirtiéndome mientras me transformo!)
• Estiramientos: 15 min (¡flexibilidad de gato!)
• ¡Día de celebración de mi progreso! 🎉

DOMINGO - DÍA DE LA RENOVACIÓN ESPIRITUAL 😴
• Caminata meditativa: 20 min (¡conectando conmigo mismo!)
• Estiramientos suaves (¡cuidando mi templo!)
• ¡Recuperación total para conquistar la semana! 🌟

📊 MI DIARIO DE TRANSFORMACIÓN:
• Peso: [Medir cada semana - ¡cada gramo cuenta!]
• Fotos: [Cada 2 semanas - ¡documentando mi evolución!]
• Notas: [Cómo me siento - ¡mi estado de ánimo es importante!]

💡 MIS SECRETOS DEL ÉXITO:
• ¡Hidratación es mi superpoder! 💧
• Descanso entre series: 1-2 min (¡recuperación estratégica!)
• ¡Música que me hace sentir invencible! 🎵
• ¡Calentamiento siempre - ¡protegiendo mi templo! 🔥
• ¡Visualización de mis metas mientras entreno! 🎯`,
    },
    tags: ["ejercicio", "fitness", "salud", "rutina", "entrenamiento"],
    complexity: "advanced",
    estimatedTime: "20-30 minutos",
    tips: [
      "Adapta la intensidad a tu nivel actual",
      "Progresiona gradualmente en peso y repeticiones",
      "Mantén un diario de entrenamiento",
      "Escucha a tu cuerpo y ajusta según sea necesario",
      "Combina con nutrición adecuada para mejores resultados",
    ],
  },
  {
    id: "meal-plan",
    name: "Plan de comidas",
    description: "Plantilla para planificar comidas semanales",
    category: "health",
    content:
      "PLAN DE COMIDAS SEMANAL\n\nObjetivo: [Pérdida de peso/Ganancia muscular/Mantenimiento]\nCalorías objetivo: [Calorías por día]\n\nLUNES\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nMARTES\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nMIÉRCOLES\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nJUEVES\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nVIERNES\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nSÁBADO\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nDOMINGO\nDesayuno: [Comida] - [Calorías]\nAlmuerzo: [Comida] - [Calorías]\nCena: [Comida] - [Calorías]\nSnacks: [Snack 1], [Snack 2]\n\nLista de compras:\n- [Ingrediente 1]\n- [Ingrediente 2]\n- [Ingrediente 3]",
    tags: ["comida", "dieta", "nutrición", "plan"],
  },
  {
    id: "workout-log",
    name: "Registro de entrenamiento",
    description: "Plantilla para registrar progreso de ejercicios",
    category: "health",
    content:
      "REGISTRO DE ENTRENAMIENTO\n\nFecha: [Fecha]\nTipo de entrenamiento: [Fuerza/Cardio/Flexibilidad]\nDuración: [Duración]\n\nEJERCICIOS REALIZADOS:\n\n1. [Ejercicio 1]\n- Series: [Número de series]\n- Repeticiones: [Repeticiones por serie]\n- Peso: [Peso usado]\n- Notas: [Notas sobre el ejercicio]\n\n2. [Ejercicio 2]\n- Series: [Número de series]\n- Repeticiones: [Repeticiones por serie]\n- Peso: [Peso usado]\n- Notas: [Notas sobre el ejercicio]\n\n3. [Ejercicio 3]\n- Series: [Número de series]\n- Repeticiones: [Repeticiones por serie]\n- Peso: [Peso usado]\n- Notas: [Notas sobre el ejercicio]\n\nCARDIO:\n- Actividad: [Tipo de cardio]\n- Duración: [Duración]\n- Intensidad: [Baja/Media/Alta]\n\nESTIRAMIENTOS:\n- [Estiramiento 1]\n- [Estiramiento 2]\n- [Estiramiento 3]\n\nNOTAS GENERALES:\n[Observaciones sobre el entrenamiento]\n\nPRÓXIMO ENTRENAMIENTO:\n[Plan para la próxima sesión]",
    tags: ["entrenamiento", "registro", "progreso", "fitness"],
  },

  // Education & Study
  {
    id: "study-schedule",
    name: "Horario de estudio",
    description: "Plantilla para organizar horarios de estudio",
    category: "education",
    content:
      "HORARIO DE ESTUDIO SEMANAL\n\nObjetivo: [Meta de estudio]\n\nLUNES\n8:00-9:00: [Materia 1] - [Tema específico]\n10:00-11:00: [Materia 2] - [Tema específico]\n14:00-15:00: [Materia 3] - [Tema específico]\n16:00-17:00: Repaso general\n\nMARTES\n8:00-9:00: [Materia 1] - [Tema específico]\n10:00-11:00: [Materia 2] - [Tema específico]\n14:00-15:00: [Materia 3] - [Tema específico]\n16:00-17:00: Ejercicios prácticos\n\nMIÉRCOLES\n8:00-9:00: [Materia 1] - [Tema específico]\n10:00-11:00: [Materia 2] - [Tema específico]\n14:00-15:00: [Materia 3] - [Tema específico]\n16:00-17:00: Evaluación de progreso\n\nJUEVES\n8:00-9:00: [Materia 1] - [Tema específico]\n10:00-11:00: [Materia 2] - [Tema específico]\n14:00-15:00: [Materia 3] - [Tema específico]\n16:00-17:00: Resolución de dudas\n\nVIERNES\n8:00-9:00: [Materia 1] - [Tema específico]\n10:00-11:00: [Materia 2] - [Tema específico]\n14:00-15:00: [Materia 3] - [Tema específico]\n16:00-17:00: Simulacro de examen\n\nSÁBADO\n10:00-12:00: Repaso semanal\n14:00-16:00: Ejercicios adicionales\n\nDOMINGO\nDescanso y preparación para la semana\n\nTÉCNICAS DE ESTUDIO A UTILIZAR:\n- [Técnica 1]\n- [Técnica 2]\n- [Técnica 3]\n\nMETAS SEMANALES:\n- [Meta 1]\n- [Meta 2]\n- [Meta 3]",
    tags: ["estudio", "horario", "académico", "organización"],
  },
  {
    id: "note-taking",
    name: "Técnica de toma de notas",
    description: "Plantilla para tomar notas efectivas",
    category: "education",
    content:
      "TÉCNICA DE TOMA DE NOTAS - [Materia/Tema]\n\nFecha: [Fecha]\nTema: [Tema principal]\n\nESQUEMA:\n\nI. [Punto principal 1]\n   A. [Subpunto 1.1]\n      - [Detalle]\n      - [Detalle]\n   B. [Subpunto 1.2]\n      - [Detalle]\n      - [Detalle]\n\nII. [Punto principal 2]\n    A. [Subpunto 2.1]\n       - [Detalle]\n       - [Detalle]\n    B. [Subpunto 2.2]\n       - [Detalle]\n       - [Detalle]\n\nIII. [Punto principal 3]\n     A. [Subpunto 3.1]\n        - [Detalle]\n        - [Detalle]\n     B. [Subpunto 3.2]\n        - [Detalle]\n        - [Detalle]\n\nCONCEPTOS CLAVE:\n- [Concepto 1]: [Definición]\n- [Concepto 2]: [Definición]\n- [Concepto 3]: [Definición]\n\nEJEMPLOS:\n- [Ejemplo 1]\n- [Ejemplo 2]\n- [Ejemplo 3]\n\nFÓRMULAS/ECUACIONES:\n- [Fórmula 1]: [Descripción]\n- [Fórmula 2]: [Descripción]\n\nPREGUNTAS:\n- [Pregunta 1]\n- [Pregunta 2]\n- [Pregunta 3]\n\nRESUMEN:\n[Resumen de los puntos más importantes]\n\nPRÓXIMOS PASOS:\n- [Acción 1]\n- [Acción 2]",
    tags: ["notas", "estudio", "aprendizaje", "técnica"],
  },
  {
    id: "exam-preparation",
    name: "Preparación para examen",
    description: "Plan de estudio para exámenes",
    category: "education",
    content:
      "PLAN DE PREPARACIÓN PARA EXAMEN\n\nExamen: [Nombre del examen]\nFecha: [Fecha del examen]\nMateria: [Materia]\n\nTEMAS A REPASAR:\n\n1. [Tema 1] - Prioridad: [Alta/Media/Baja]\n   - Conceptos clave: [Lista]\n   - Fórmulas: [Lista]\n   - Ejercicios tipo: [Descripción]\n\n2. [Tema 2] - Prioridad: [Alta/Media/Baja]\n   - Conceptos clave: [Lista]\n   - Fórmulas: [Lista]\n   - Ejercicios tipo: [Descripción]\n\n3. [Tema 3] - Prioridad: [Alta/Media/Baja]\n   - Conceptos clave: [Lista]\n   - Fórmulas: [Lista]\n   - Ejercicios tipo: [Descripción]\n\nCRONOGRAMA DE ESTUDIO:\n\nSemana 1:\n- Lunes: [Tema 1] - [Horas]\n- Martes: [Tema 2] - [Horas]\n- Miércoles: [Tema 3] - [Horas]\n- Jueves: Repaso general - [Horas]\n- Viernes: Ejercicios prácticos - [Horas]\n\nSemana 2:\n- Lunes: [Tema 1] - [Horas]\n- Martes: [Tema 2] - [Horas]\n- Miércoles: [Tema 3] - [Horas]\n- Jueves: Simulacro de examen - [Horas]\n- Viernes: Resolución de dudas - [Horas]\n\nRECURSOS NECESARIOS:\n- [Recurso 1]\n- [Recurso 2]\n- [Recurso 3]\n\nESTRATEGIAS DE EXAMEN:\n- [Estrategia 1]\n- [Estrategia 2]\n- [Estrategia 3]\n\nMETAS:\n- [Meta 1]\n- [Meta 2]\n- [Meta 3]",
    tags: ["examen", "preparación", "estudio", "plan"],
  },

  // Productivity
  {
    id: "daily-routine",
    name: "Rutina diaria",
    description: "Plantilla para organizar rutinas diarias",
    category: "productivity",
    content:
      "RUTINA DIARIA - [Día de la semana]\n\nMAÑANA (6:00-12:00)\n6:00 - Despertar y ejercicio matutino\n6:30 - Ducha y preparación\n7:00 - Desayuno saludable\n7:30 - Revisión de agenda del día\n8:00 - [Tarea principal 1]\n10:00 - Pausa para café\n10:15 - [Tarea principal 2]\n12:00 - Almuerzo\n\nTARDE (12:00-18:00)\n13:00 - [Tarea principal 3]\n15:00 - Pausa para estiramientos\n15:15 - [Tarea principal 4]\n17:00 - Revisión de progreso del día\n17:30 - Planificación para mañana\n18:00 - Finalización de trabajo\n\nNOCHE (18:00-22:00)\n18:30 - Ejercicio vespertino\n19:30 - Cena\n20:00 - Tiempo personal/Hobby\n21:00 - Preparación para dormir\n21:30 - Lectura\n22:00 - Dormir\n\nTAREAS PRIORITARIAS:\n- [Tarea 1] - Urgente e importante\n- [Tarea 2] - Importante, no urgente\n- [Tarea 3] - Urgente, no importante\n\nNOTAS:\n[Observaciones sobre la rutina]\n\nAJUSTES PARA MAÑANA:\n[Cambios a implementar]",
    tags: ["rutina", "productividad", "organización", "día"],
  },
  {
    id: "goal-tracking",
    name: "Seguimiento de metas",
    description: "Plantilla para hacer seguimiento de objetivos",
    category: "productivity",
    content:
      "SEGUIMIENTO DE METAS - [Período]\n\nMETA PRINCIPAL: [Descripción de la meta]\n\nOBJETIVOS ESPECÍFICOS:\n\n1. [Objetivo 1]\n   - Fecha límite: [Fecha]\n   - Progreso actual: [% completado]\n   - Acciones realizadas:\n     * [Acción 1]\n     * [Acción 2]\n   - Próximas acciones:\n     * [Acción 3]\n     * [Acción 4]\n\n2. [Objetivo 2]\n   - Fecha límite: [Fecha]\n   - Progreso actual: [% completado]\n   - Acciones realizadas:\n     * [Acción 1]\n     * [Acción 2]\n   - Próximas acciones:\n     * [Acción 3]\n     * [Acción 4]\n\n3. [Objetivo 3]\n   - Fecha límite: [Fecha]\n   - Progreso actual: [% completado]\n   - Acciones realizadas:\n     * [Acción 1]\n     * [Acción 2]\n   - Próximas acciones:\n     * [Acción 3]\n     * [Acción 4]\n\nMÉTRICAS DE SEGUIMIENTO:\n- [Métrica 1]: [Valor actual] / [Meta]\n- [Métrica 2]: [Valor actual] / [Meta]\n- [Métrica 3]: [Valor actual] / [Meta]\n\nOBSTÁCULOS IDENTIFICADOS:\n- [Obstáculo 1] - Solución: [Solución]\n- [Obstáculo 2] - Solución: [Solución]\n\nLECCIONES APRENDIDAS:\n- [Lección 1]\n- [Lección 2]\n- [Lección 3]\n\nPRÓXIMA REVISIÓN:\n[Fecha de la próxima revisión]",
    tags: ["metas", "seguimiento", "objetivos", "progreso"],
  },

  // Social
  {
    id: "social-media-post",
    name: "Post para redes sociales",
    description: "Plantilla para crear contenido en redes sociales",
    category: "social",
    content:
      "POST PARA REDES SOCIALES\n\nTítulo: [Título llamativo]\n\nHashtags: #[hashtag1] #[hashtag2] #[hashtag3]\n\nContenido:\n\n[Primera línea - Hook]\n\n[Segunda línea - Desarrollo]\n\n[Línea de cierre]\n\nCall to Action: [¿Qué quieres que hagan?]\n\nElementos visuales:\n- [Imagen/Video/GIF]\n- [Emojis relevantes]\n\nHorario de publicación: [Día y hora]\n\nPúblico objetivo: [Descripción del público]\n\nMétricas a medir:\n- [Métrica 1]\n- [Métrica 2]\n- [Métrica 3]",
    tags: ["redes sociales", "post", "marketing", "contenido"],
  },
  {
    id: "event-invitation",
    name: "Invitación a evento",
    description: "Plantilla para invitar a eventos",
    category: "social",
    content:
      "INVITACIÓN A EVENTO\n\n¡Hola [nombre]!\n\nTe invito a [nombre del evento] que se realizará el [fecha] a las [hora].\n\nDetalles del evento:\n- Lugar: [Dirección]\n- Fecha: [Fecha completa]\n- Hora: [Hora de inicio]\n- Duración: [Duración aproximada]\n\nActividades programadas:\n- [Actividad 1]\n- [Actividad 2]\n- [Actividad 3]\n\n¿Qué incluye?\n- [Incluye 1]\n- [Incluye 2]\n- [Incluye 3]\n\n¿Qué traer?\n- [Item 1]\n- [Item 2]\n- [Item 3]\n\nConfirmación:\nPor favor confirma tu asistencia antes del [fecha límite] respondiendo a este mensaje.\n\n¡Espero verte ahí!\n\nSaludos,\n[Tu nombre]\n\nP.S. [Información adicional si es necesaria]",
    tags: ["evento", "invitación", "social", "reunión"],
  },

  // Finance
  {
    id: "budget-template",
    name: "Presupuesto mensual",
    description: "Plantilla para organizar presupuesto personal",
    category: "finance",
    content:
      "PRESUPUESTO MENSUAL - [Mes/Año]\n\nINGRESOS:\n- Salario: [Cantidad]\n- Ingresos adicionales: [Cantidad]\n- Otros: [Cantidad]\nTotal ingresos: [Total]\n\nGASTOS FIJOS:\n- Vivienda: [Cantidad]\n- Servicios básicos: [Cantidad]\n- Transporte: [Cantidad]\n- Seguros: [Cantidad]\n- Suscripciones: [Cantidad]\nTotal gastos fijos: [Total]\n\nGASTOS VARIABLES:\n- Alimentación: [Cantidad]\n- Entretenimiento: [Cantidad]\n- Ropa: [Cantidad]\n- Salud: [Cantidad]\n- Otros: [Cantidad]\nTotal gastos variables: [Total]\n\nAHORRO E INVERSIÓN:\n- Ahorro de emergencia: [Cantidad]\n- Inversiones: [Cantidad]\n- Metas financieras: [Cantidad]\nTotal ahorro: [Total]\n\nRESUMEN:\nIngresos totales: [Cantidad]\nGastos totales: [Cantidad]\nAhorro: [Cantidad]\nBalance: [Balance]\n\nMETAS FINANCIERAS:\n- [Meta 1]: [Cantidad objetivo]\n- [Meta 2]: [Cantidad objetivo]\n- [Meta 3]: [Cantidad objetivo]\n\nNOTAS:\n[Observaciones sobre el presupuesto]",
    tags: ["presupuesto", "finanzas", "ahorro", "gastos"],
  },

  // Creative
  {
    id: "story-outline",
    name: "Estructura de historia",
    description: "Plantilla para escribir historias",
    category: "creative",
    content:
      "Título: [Título de la historia]\n\nGénero: [Género]\n\nPersonajes principales:\n- [Personaje 1]: [Descripción]\n- [Personaje 2]: [Descripción]\n\nEscenario:\n[Descripción del lugar y época]\n\nEstructura:\n\nActo 1 - Introducción:\n[Descripción del acto 1]\n\nActo 2 - Desarrollo:\n[Descripción del acto 2]\n\nActo 3 - Resolución:\n[Descripción del acto 3]\n\nTema central:\n[Tema o mensaje principal]",
    tags: ["historia", "escritura", "creativo"],
  },
  {
    id: "poem-structure",
    name: "Estructura de poema",
    description: "Plantilla para escribir poesía",
    category: "creative",
    content:
      "[Título del poema]\n\n[Primera estrofa]\n[Segunda línea]\n[Tercera línea]\n[Cuarta línea]\n\n[Segunda estrofa]\n[Segunda línea]\n[Tercera línea]\n[Cuarta línea]\n\n[Estrofa final]\n[Segunda línea]\n[Tercera línea]\n[Cuarta línea]",
    tags: ["poema", "poesía", "creativo"],
  },

  // Academic
  {
    id: "essay-outline",
    name: "Estructura de ensayo",
    description: "Plantilla para ensayos académicos",
    category: "academic",
    content:
      "Título: [Título del ensayo]\n\nIntroducción:\n[Tesis principal]\n[Contexto del tema]\n[Justificación de la importancia]\n\nDesarrollo:\n\nPárrafo 1 - [Primer argumento]:\n[Desarrollo del argumento]\n[Ejemplos y evidencia]\n\nPárrafo 2 - [Segundo argumento]:\n[Desarrollo del argumento]\n[Ejemplos y evidencia]\n\nPárrafo 3 - [Tercer argumento]:\n[Desarrollo del argumento]\n[Ejemplos y evidencia]\n\nConclusión:\n[Resumen de argumentos]\n[Reafirmación de la tesis]\n[Implicaciones o recomendaciones]",
    tags: ["ensayo", "académico", "investigación"],
  },
  {
    id: "research-summary",
    name: "Resumen de investigación",
    description: "Estructura para resúmenes de investigación",
    category: "academic",
    content:
      "RESUMEN DE INVESTIGACIÓN\n\nTítulo: [Título de la investigación]\n\nAutores: [Nombres de los autores]\n\nResumen:\n[Descripción breve del estudio]\n\nPalabras clave: [Palabras clave]\n\nIntroducción:\n[Contexto y justificación]\n\nMetodología:\n[Diseño del estudio]\n[Participantes]\n[Procedimientos]\n\nResultados:\n[Hallazgos principales]\n\nDiscusión:\n[Interpretación de resultados]\n[Limitaciones]\n[Implicaciones]\n\nConclusión:\n[Conclusiones principales]\n\nReferencias:\n[Lista de referencias]",
    tags: ["investigación", "académico", "resumen"],
  },

  // Personal
  {
    id: "personal-reflection",
    name: "Reflexión personal",
    description: "Estructura para reflexiones personales",
    category: "personal",
    content:
      "Reflexión Personal\n\nFecha: [Fecha]\n\nSituación:\n[Descripción de la situación o experiencia]\n\nPensamientos:\n[Qué pensé en ese momento]\n\nEmociones:\n[Cómo me sentí]\n\nAprendizajes:\n[Qué aprendí de esta experiencia]\n\nAcciones futuras:\n[Qué haré diferente en el futuro]\n\nGratitud:\n[Por qué estoy agradecido]",
    tags: ["reflexión", "personal", "crecimiento"],
  },
  {
    id: "goal-setting",
    name: "Establecimiento de metas",
    description: "Plantilla para establecer metas personales",
    category: "personal",
    content:
      "ESTABLECIMIENTO DE METAS\n\nMeta principal: [Descripción de la meta]\n\n¿Por qué es importante?\n[Justificación personal]\n\nObjetivos específicos:\n- [Objetivo 1]\n- [Objetivo 2]\n- [Objetivo 3]\n\nIndicadores de éxito:\n- [Indicador 1]\n- [Indicador 2]\n- [Indicador 3]\n\nPlan de acción:\n- [Acción 1] - Fecha: [Fecha]\n- [Acción 2] - Fecha: [Fecha]\n- [Acción 3] - Fecha: [Fecha]\n\nObstáculos potenciales:\n- [Obstáculo 1] - Solución: [Solución]\n- [Obstáculo 2] - Solución: [Solución]\n\nSistema de seguimiento:\n[Cómo mediré el progreso]",
    tags: ["metas", "objetivos", "personal"],
  },

  // Technical
  {
    id: "bug-report",
    name: "Reporte de bug",
    description: "Estructura para reportar errores técnicos",
    category: "technical",
    content:
      "REPORTE DE BUG\n\nTítulo: [Descripción breve del problema]\n\nSeveridad: [Crítica/Alta/Media/Baja]\n\nDescripción:\n[Descripción detallada del problema]\n\nPasos para reproducir:\n1. [Paso 1]\n2. [Paso 2]\n3. [Paso 3]\n\nComportamiento esperado:\n[Qué debería pasar]\n\nComportamiento actual:\n[Qué está pasando]\n\nInformación del sistema:\n- Navegador: [Navegador y versión]\n- Sistema operativo: [OS y versión]\n- Dispositivo: [Tipo de dispositivo]\n\nCapturas de pantalla:\n[Enlaces a capturas si aplica]\n\nLogs de error:\n[Logs si están disponibles]",
    tags: ["bug", "error", "técnico"],
  },
  {
    id: "feature-request",
    name: "Solicitud de función",
    description: "Estructura para solicitar nuevas funciones",
    category: "technical",
    content:
      "SOLICITUD DE FUNCIÓN\n\nTítulo: [Nombre de la función]\n\nDescripción:\n[Descripción detallada de la función]\n\nJustificación:\n[Por qué es necesaria esta función]\n\nCasos de uso:\n- [Caso de uso 1]\n- [Caso de uso 2]\n- [Caso de uso 3]\n\nCriterios de aceptación:\n- [Criterio 1]\n- [Criterio 2]\n- [Criterio 3]\n\nPrioridad: [Alta/Media/Baja]\n\nImpacto:\n[Qué impacto tendría en los usuarios]\n\nAlternativas consideradas:\n[Otras opciones evaluadas]",
    tags: ["función", "mejora", "técnico"],
  },
];

export const getTemplatesByCategory = (category: string): MessageTemplate[] => {
  return messageTemplates.filter((template) => template.category === category);
};

export const searchTemplates = (query: string): MessageTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return messageTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      (template.tips && template.tips.some((tip) => tip.toLowerCase().includes(lowerQuery)))
  );
};

export const getTemplateById = (id: string): MessageTemplate | undefined => {
  return messageTemplates.find((template) => template.id === id);
};
