import type { PartialCrmMessages } from "./englishCrmMessages";

// Supabase auth strings (no official Spanish package exists)
const raSupabaseSpanishMessages = {
  "ra-supabase": {
    auth: {
      email: "Correo electrónico",
      confirm_password: "Confirmar contraseña",
      sign_in_with: "Entrar con %{provider}",
      forgot_password: "¿Olvidaste tu contraseña?",
      reset_password: "Restablecer contraseña",
      password_reset:
        "Tu contraseña ha sido restablecida. Recibirás un correo con un enlace para iniciar sesión.",
      missing_tokens: "Faltan los tokens de acceso y actualización",
      back_to_login: "Volver al inicio de sesión",
    },
    reset_password: {
      forgot_password: "¿Olvidaste tu contraseña?",
      forgot_password_details: "Ingresa tu correo para recibir instrucciones.",
    },
    set_password: {
      new_password: "Elige tu contraseña",
    },
    validation: {
      password_mismatch: "Las contraseñas no coinciden",
    },
  },
};

// Override ra core strings that need custom values for this app
const raCoreOverrides = {
  ra: {
    page: {
      dashboard: "Inicio",
    },
    action: {
      add_filter: "Agregar filtro",
      add: "Agregar",
      back: "Volver",
      bulk_actions:
        "%{smart_count} elemento seleccionado |||| %{smart_count} elementos seleccionados",
      cancel: "Cancelar",
      clear_array_input: "Vaciar la lista",
      clear_input_value: "Borrar valor",
      clone: "Clonar",
      confirm: "Confirmar",
      create: "Crear",
      create_item: "Crear %{item}",
      delete: "Eliminar",
      edit: "Editar",
      export: "Exportar",
      list: "Listar",
      refresh: "Actualizar",
      remove_filter: "Quitar este filtro",
      remove_all_filters: "Quitar todos los filtros",
      remove: "Quitar",
      save: "Guardar",
      search: "Buscar",
      select_all: "Seleccionar todo",
      select_all_button: "Seleccionar todo",
      select_row: "Seleccionar esta fila",
      show: "Ver",
      sort: "Ordenar",
      undo: "Deshacer",
      unselect: "Deseleccionar",
      expand: "Expandir",
      close: "Cerrar",
      open_menu: "Abrir menú",
      close_menu: "Cerrar menú",
      update: "Actualizar",
      move_up: "Mover arriba",
      move_down: "Mover abajo",
      open: "Abrir",
      toggle_theme: "Cambiar tema",
      select_columns: "Columnas",
      update_application: "Recargar aplicación",
    },
    boolean: {
      true: "Sí",
      false: "No",
      null: " ",
    },
    auth: {
      auth_check_error: "Por favor inicia sesión para continuar",
      user_menu: "Perfil",
      username: "Usuario",
      password: "Contraseña",
      email: "Correo electrónico",
      sign_in: "Iniciar sesión",
      sign_in_error: "Error al autenticar. Por favor, intenta de nuevo.",
      logout: "Cerrar sesión",
    },
    message: {
      about: "Acerca de",
      are_you_sure: "¿Estás seguro?",
      auth_error: "Se produjo un error al validar el token de autenticación.",
      bulk_delete_content:
        "¿Estás seguro de que quieres eliminar %{name}? |||| ¿Estás seguro de que quieres eliminar estos %{smart_count} elementos?",
      bulk_delete_title:
        "Eliminar %{name} |||| Eliminar %{smart_count} %{name}",
      bulk_update_content:
        "¿Estás seguro de que quieres actualizar %{name}? |||| ¿Estás seguro de que quieres actualizar estos %{smart_count} elementos?",
      bulk_update_title:
        "Actualizar %{name} |||| Actualizar %{smart_count} %{name}",
      clear_array_input: "¿Estás seguro de que quieres vaciar la lista?",
      delete_content: "¿Estás seguro de que quieres eliminar este elemento?",
      delete_title: "Eliminar %{name} #%{id}",
      details: "Detalles",
      error:
        "Se produjo un error en el cliente y tu solicitud no pudo completarse.",
      invalid_form:
        "El formulario no es válido. Por favor corrije los errores.",
      loading: "La página está cargando, por favor espera un momento",
      no: "No",
      not_found:
        "O escribiste una URL incorrecta, o seguiste un enlace incorrecto.",
      yes: "Sí",
      unsaved_changes:
        "Algunos cambios no se guardaron. ¿Estás seguro de que quieres ignorarlos?",
    },
    navigation: {
      no_results: "Sin resultados",
      no_more_results:
        "La página %{page} está fuera de los límites. Prueba la página anterior.",
      page_out_of_boundaries: "Número de página %{page} fuera de los límites",
      page_out_from_end: "No puedes ir después de la última página",
      page_out_from_begin: "No puedes ir antes de la página 1",
      page_range_info: "%{offsetBegin} - %{offsetEnd} de %{total}",
      partial_page_range_info:
        "%{offsetBegin}-%{offsetEnd} de más de %{offsetEnd}",
      current_page: "Página %{page}",
      page: "Ir a la página %{page}",
      first: "Ir a la primera página",
      last: "Ir a la última página",
      next: "Siguiente",
      previous: "Anterior",
      page_rows_per_page: "Filas por página:",
      skip_nav: "Saltar al contenido",
    },
    sort: {
      sort_by: "Ordenar por %{field} %{order}",
      ASC: "ascendente",
      DESC: "descendente",
    },
    notification: {
      updated:
        "Elemento actualizado |||| %{smart_count} elementos actualizados",
      created: "Elemento creado",
      deleted: "Elemento eliminado |||| %{smart_count} elementos eliminados",
      bad_item: "Elemento incorrecto",
      item_doesnt_exist: "El elemento no existe",
      http_error: "Error de comunicación con el servidor",
      data_provider_error:
        "Error en el proveedor de datos. Revisa la consola para más detalles.",
      i18n_error:
        "No se pudieron cargar las traducciones para el idioma especificado",
      canceled: "Acción cancelada",
      logged_out: "Tu sesión ha finalizado, por favor vuelve a conectarte.",
      not_authorized: "No tienes permiso para acceder a este recurso.",
      application_update_available: "Hay una nueva versión disponible.",
    },
    validation: {
      required: "Campo obligatorio",
      minLength: "Debe tener al menos %{min} caracteres",
      maxLength: "Debe tener %{max} caracteres como máximo",
      minValue: "Debe ser al menos %{min}",
      maxValue: "Debe ser como máximo %{max}",
      number: "Debe ser un número",
      email: "Correo electrónico inválido",
      oneOf: "Debe ser uno de: %{options}",
      regex: "Debe coincidir con el formato específico (regexp): %{pattern}",
      unique: "Debe ser único",
    },
  },
};

export const spanishCrmMessages: PartialCrmMessages &
  typeof raSupabaseSpanishMessages &
  typeof raCoreOverrides = {
  ...raSupabaseSpanishMessages,
  ...raCoreOverrides,
  resources: {
    companies: {
      name: "Empresa |||| Empresas",
      forcedCaseName: "Empresa",
      fields: {
        name: "Nombre de empresa",
        website: "Sitio web",
        linkedin_url: "URL de LinkedIn",
        phone_number: "Teléfono",
        created_at: "Registrado el",
        nb_contacts: "Número de contactos",
        revenue: "Ingresos",
        sector: "Sector",
        size: "Tamaño",
        tax_identifier: "RIF / NIF",
        address: "Dirección",
        city: "Ciudad",
        zipcode: "Código postal",
        state_abbr: "Estado",
        country: "País",
        description: "Descripción",
        context_links: "Enlaces de contexto",
        sales_id: "Gerente de cuenta",
      },
      empty: {
        description: "Parece que tu lista de empresas está vacía.",
        title: "No se encontraron empresas",
      },
      field_categories: {
        contact: "Contacto",
        additional_info: "Información adicional",
        address: "Dirección",
        context: "Contexto",
      },
      action: {
        create: "Crear empresa",
        edit: "Editar empresa",
        new: "Nueva empresa",
        show: "Ver empresa",
      },
      added_on: "Registrado el %{date}",
      followed_by: "A cargo de %{name}",
      followed_by_you: "A tu cargo",
      no_contacts: "Sin contactos",
      nb_contacts: "%{smart_count} contacto |||| %{smart_count} contactos",
      nb_deals: "%{smart_count} deal |||| %{smart_count} deals",
      sizes: {
        one_employee: "1 empleado",
        two_to_nine_employees: "2-9 empleados",
        ten_to_forty_nine_employees: "10-49 empleados",
        fifty_to_two_hundred_forty_nine_employees: "50-249 empleados",
        two_hundred_fifty_or_more_employees: "250 o más empleados",
      },
      autocomplete: {
        create_error: "Ocurrió un error al crear la empresa",
        create_item: "Crear %{item}",
        create_label: "Empieza a escribir para crear una nueva empresa",
      },
      filters: {
        only_mine: "Solo empresas que gestiono",
      },
    },
    contacts: {
      name: "Contacto |||| Contactos",
      forcedCaseName: "Contacto",
      field_categories: {
        background_info: "Información de contexto",
        identity: "Identidad",
        misc: "Otros",
        personal_info: "Información personal",
        position: "Cargo",
      },
      fields: {
        first_name: "Nombre",
        last_name: "Apellido",
        last_seen: "Última actividad",
        title: "Cargo",
        company_id: "Empresa",
        email_jsonb: "Correos electrónicos",
        email: "Correo electrónico",
        phone_jsonb: "Teléfonos",
        phone_number: "Teléfono",
        linkedin_url: "URL de LinkedIn",
        background: "Contexto (bio, cómo lo conociste, etc.)",
        has_newsletter: "Suscrito al boletín",
        sales_id: "Responsable",
      },
      action: {
        add: "Agregar contacto",
        add_first: "Agrega tu primer contacto",
        create: "Crear contacto",
        edit: "Editar contacto",
        export_vcard: "Exportar a vCard",
        new: "Nuevo contacto",
        show: "Ver contacto",
      },
      background: {
        last_activity_on: "Última actividad el %{date}",
        added_on: "Registrado el %{date}",
        followed_by: "A cargo de %{name}",
        followed_by_you: "A tu cargo",
        status_none: "Ninguno",
      },
      position_at: "%{title} en",
      position_at_company: "%{title} en %{company}",
      empty: {
        description: "Parece que tu lista de contactos está vacía.",
        title: "No se encontraron contactos",
      },
      import: {
        title: "Importar contactos",
        button: "Importar CSV",
        complete:
          "Importación completada. Se importaron %{importCount} contactos con %{errorCount} errores",
        progress:
          "Importados %{importCount} / %{rowCount} contactos, con %{errorCount} errores.",
        error:
          "Error al importar el archivo. Por favor, asegúrate de proporcionar un archivo CSV válido.",
        imported: "Importados",
        remaining_time: "Tiempo estimado restante:",
        running:
          "La importación está en curso, por favor no cierres esta pestaña.",
        sample_download: "Descargar CSV de muestra",
        sample_hint:
          "Aquí tienes un archivo CSV de muestra que puedes usar como plantilla",
        stop: "Detener importación",
        csv_file: "Archivo CSV",
        contacts_label: "contacto |||| contactos",
      },
      inputs: {
        genders: {
          male: "Él / Masculino",
          female: "Ella / Femenino",
          nonbinary: "Elle / No binario",
        },
        personal_info_types: {
          work: "Trabajo",
          home: "Personal",
          other: "Otro",
        },
      },
      list: {
        error_loading: "Error al cargar contactos",
      },
      bulk_tag: {
        action: "Etiquetar",
        back: "Volver a etiquetas",
        create_description:
          "Crea una nueva etiqueta y aplícala a los contactos seleccionados.",
        description:
          "Elige una etiqueta existente o crea una nueva para los contactos seleccionados.",
        empty:
          "Aún no hay etiquetas. Crea una para etiquetar los contactos seleccionados.",
        error: "Error al agregar la etiqueta a los contactos",
        noop: "Los contactos seleccionados ya tienen esta etiqueta",
        success:
          "Etiqueta aplicada a %{smart_count} contacto |||| Etiqueta aplicada a %{smart_count} contactos",
        title: "Agregar etiqueta a contactos",
      },
      merge: {
        action: "Fusionar con otro contacto",
        confirm: "Fusionar contactos",
        current_contact: "Contacto actual (será eliminado)",
        description: "Fusiona este contacto con otro.",
        error: "Error al fusionar los contactos",
        merging: "Fusionando...",
        no_additional_data: "Sin datos adicionales para fusionar",
        select_target: "Por favor selecciona un contacto con el que fusionar",
        success: "Contactos fusionados exitosamente",
        target_contact: "Contacto destino (se conservará)",
        title: "Fusionar contacto",
        warning_description:
          "Todos los datos serán transferidos al segundo contacto. Esta acción no se puede deshacer.",
        warning_title: "Advertencia: Operación destructiva",
        what_will_be_merged: "Qué se fusionará:",
      },
      filters: {
        before_last_month: "Antes del mes pasado",
        before_this_month: "Antes de este mes",
        before_this_week: "Antes de esta semana",
        managed_by_me: "Gestionados por mí",
        search: "Buscar nombre, empresa...",
        this_week: "Esta semana",
        today: "Hoy",
        tags: "Etiquetas",
        tasks: "Tareas",
      },
      hot: {
        empty_change_status:
          'Cambia el estado de un contacto agregando una nota y haciendo clic en "mostrar opciones".',
        empty_hint: 'Los contactos con estado "caliente" aparecerán aquí.',
        title: "Contactos calientes",
      },
    },
    deals: {
      name: "Deal |||| Deals",
      fields: {
        name: "Nombre",
        description: "Descripción",
        company_id: "Empresa",
        contact_ids: "Contactos",
        category: "Tipo de servicio",
        amount: "Valor",
        expected_closing_date: "Fecha de cierre esperada",
        stage: "Etapa",
      },
      action: {
        back_to_deal: "Volver al deal",
        create: "Crear deal",
        new: "Nuevo deal",
      },
      field_categories: {
        misc: "Otros",
      },
      archived: {
        action: "Archivar",
        error: "Error: deal no archivado",
        list_title: "Deals archivados",
        success: "Deal archivado",
        title: "Deal archivado",
        view: "Ver deals archivados",
      },
      inputs: {
        linked_to: "Vinculado a",
      },
      unarchived: {
        action: "Devolver al tablero",
        error: "Error: deal no desarchivado",
        success: "Deal desarchivado",
      },
      updated: "Deal actualizado",
      empty: {
        before_create: "antes de crear un deal.",
        description: "Parece que tu lista de deals está vacía.",
        title: "No se encontraron deals",
      },
      invalid_date: "Fecha inválida",
    },
    notes: {
      name: "Nota |||| Notas",
      forcedCaseName: "Nota",
      fields: {
        status: "Estado",
        date: "Fecha",
        attachments: "Archivos adjuntos",
        contact_id: "Contacto",
        deal_id: "Deal",
      },
      action: {
        add: "Agregar nota",
        add_first: "Agrega tu primera nota",
        delete: "Eliminar nota",
        edit: "Editar nota",
        update: "Actualizar nota",
        add_this: "Agregar esta nota",
      },
      sheet: {
        create: "Crear nota",
        create_for: "Crear nota para %{name}",
        edit: "Editar nota",
        edit_for: "Editar nota para %{name}",
      },
      deleted: "Nota eliminada",
      empty: "Aún no hay notas",
      author_added: "%{name} agregó una nota",
      you_added: "Tú agregaste una nota",
      me: "Yo",
      list: {
        error_loading: "Error al cargar las notas",
      },
      note_for_contact: "Nota para %{name}",
      stepper: {
        hint: "Ve a un contacto y agrega una nota",
      },
      added: "Nota agregada",
      inputs: {
        add_note: "Agregar una nota",
        options_hint: "(adjuntar archivos o cambiar detalles)",
        show_options: "Mostrar opciones",
      },
      actions: {
        attach_document: "Adjuntar documento",
      },
      validation: {
        note_or_attachment_required:
          "Se requiere una nota o un archivo adjunto",
      },
    },
    sales: {
      name: "Usuario |||| Usuarios",
      fields: {
        first_name: "Nombre",
        last_name: "Apellido",
        email: "Correo electrónico",
        administrator: "Administrador",
        disabled: "Deshabilitado",
      },
      create: {
        error: "Ocurrió un error al crear el usuario.",
        success:
          "Usuario creado. Recibirá pronto un correo para configurar su contraseña.",
        title: "Crear nuevo usuario",
      },
      edit: {
        error: "Ocurrió un error. Por favor intenta de nuevo.",
        record_not_found: "Registro no encontrado",
        success: "Usuario actualizado exitosamente",
        title: "Editar %{name}",
      },
      action: {
        new: "Nuevo usuario",
      },
    },
    contact_statuses: {
      name: "Estado de contacto |||| Estados de contacto",
      fields: {
        label: "Nombre del estado",
        color: "Color",
        icon: "Ícono",
        position: "Orden",
        is_default: "Por defecto",
      },
    },
    tasks: {
      name: "Tarea |||| Tareas",
      forcedCaseName: "Tarea",
      fields: {
        text: "Descripción",
        due_date: "Fecha límite",
        type: "Tipo",
        contact_id: "Contacto",
        due_short: "vence",
      },
      action: {
        add: "Agregar tarea",
        create: "Crear tarea",
        edit: "Editar tarea",
      },
      actions: {
        postpone_next_week: "Posponer a la próxima semana",
        postpone_tomorrow: "Posponer a mañana",
        title: "acciones de tarea",
      },
      added: "Tarea agregada",
      deleted: "Tarea eliminada exitosamente",
      dialog: {
        create: "Crear tarea",
        create_for: "Crear tarea para %{name}",
      },
      sheet: {
        edit: "Editar tarea",
        edit_for: "Editar tarea para %{name}",
      },
      empty: "Aún no hay tareas",
      empty_list_hint: "Las tareas agregadas a tus contactos aparecerán aquí.",
      filters: {
        later: "Más adelante",
        overdue: "Vencidas",
        this_week: "Esta semana",
        today: "Hoy",
        tomorrow: "Mañana",
        with_pending: "Con tareas pendientes",
      },
      regarding_contact: "(Re: %{name})",
      updated: "Tarea actualizada",
    },
    tags: {
      name: "Etiqueta |||| Etiquetas",
      action: {
        add: "Agregar etiqueta",
        create: "Crear nueva etiqueta",
      },
      dialog: {
        color: "Color",
        create_title: "Crear nueva etiqueta",
        edit_title: "Editar etiqueta",
        name_label: "Nombre de la etiqueta",
        name_placeholder: "Ingresa el nombre de la etiqueta",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Restablecer contraseña",
    },
    contacts: {
      created_task_reminder:
        "Contacto creado. Recuerda crear una tarea para darle seguimiento.",
    },
    auth: {
      first_name: "Nombre",
      last_name: "Apellido",
      confirm_password: "Confirmar contraseña",
      confirmation_required:
        "Por favor, sigue el enlace que te enviamos por correo para confirmar tu cuenta.",
      recovery_email_sent:
        "Si eres usuario registrado, recibirás pronto un correo para recuperar tu contraseña.",
      sign_in_failed: "Error al iniciar sesión.",
      sign_in_google_workspace: "Iniciar sesión con Google Workspace",
      signup: {
        create_account: "Crear cuenta",
        create_first_user:
          "Crea el primer usuario para completar la configuración.",
        creating: "Creando...",
        initial_user_created: "Usuario inicial creado exitosamente",
      },
      welcome_title: "Bienvenido a Neon CRM",
    },
    common: {
      activity: "Actividad",
      added: "registrado",
      details: "Detalles",
      last_activity_with_date: "última actividad %{date}",
      load_more: "Cargar más",
      misc: "Otros",
      past: "Pasado",
      read_more: "Leer más",
      retry: "Reintentar",
      show_less: "Mostrar menos",
      copied: "¡Copiado!",
      copy: "Copiar",
      loading: "Cargando...",
      me: "Yo",
      task_count: "%{smart_count} tarea |||| %{smart_count} tareas",
    },
    activity: {
      added_company: "%{name} registró la empresa",
      you_added_company: "Tú registraste la empresa",
      added_contact: "%{name} agregó",
      you_added_contact: "Tú agregaste",
      added_note: "%{name} agregó una nota sobre",
      you_added_note: "Tú agregaste una nota sobre",
      added_note_about_deal: "%{name} agregó una nota sobre el deal",
      you_added_note_about_deal: "Tú agregaste una nota sobre el deal",
      added_deal: "%{name} creó el deal",
      you_added_deal: "Tú creaste el deal",
      at_company: "en",
      to: "a",
      load_more: "Cargar más actividad",
    },
    dashboard: {
      deals_chart: "Ingresos de deals próximos",
      deals_pipeline: "Pipeline de deals",
      latest_activity: "Actividad reciente",
      latest_activity_error: "Error al cargar la actividad reciente",
      latest_notes: "Mis notas recientes",
      latest_notes_added_ago: "agregado %{timeAgo}",
      stepper: {
        install: "Instalar Neon CRM",
        progress: "%{step}/3 completado",
        whats_next: "¿Qué sigue?",
      },
      upcoming_tasks: "Tareas próximas",
    },
    header: {
      import_data: "Importar datos",
    },
    image_editor: {
      change: "Cambiar",
      drop_hint: "Suelta un archivo para subir, o haz clic para seleccionarlo.",
      editable_content: "Contenido editable",
      title: "Subir y recortar imagen",
      update_image: "Actualizar imagen",
    },
    import: {
      action: {
        download_error_report: "Descargar reporte de errores",
        import: "Importar",
        import_another: "Importar otro archivo",
      },
      error: {
        unable: "No se puede importar este archivo.",
      },
      idle: {
        description_1:
          "Puedes importar usuarios, empresas, contactos, notas y tareas.",
        description_2:
          "Los datos deben estar en un archivo JSON con el siguiente formato de muestra:",
      },
      status: {
        all_success: "Todos los registros fueron importados exitosamente.",
        complete: "Importación completada.",
        failed: "Fallido",
        imported: "Importado",
        in_progress:
          "Importación en curso, por favor no navegues fuera de esta página.",
        some_failed: "Algunos registros no pudieron importarse.",
        table_caption: "Estado de importación",
      },
      title: "Importar datos",
    },
    settings: {
      companies: {
        sectors: "Sectores",
      },
      dark_mode_logo: "Logo modo oscuro",
      deals: {
        categories: "Categorías",
        currency: "Moneda",
        pipeline_help:
          "Selecciona qué etapas del deal deben contarse como deals en pipeline.",
        pipeline_statuses: "Estados de pipeline",
        stages: "Etapas",
      },
      light_mode_logo: "Logo modo claro",
      notes: {
        statuses: "Estados",
      },
      reset_defaults: "Restablecer valores predeterminados",
      save_error: "Error al guardar la configuración",
      saved: "Configuración guardada exitosamente",
      saving: "Guardando...",
      tasks: {
        types: "Tipos",
      },
      preferences: "Preferencias",
      title: "Configuración",
      app_title: "Título de la app",
      sections: {
        branding: "Marca",
      },
      validation: {
        duplicate: "%{display_name} duplicado: %{items}",
        in_use:
          "No se puede eliminar %{display_name} que aún está en uso por deals: %{items}",
        validating: "Validando\u2026",
        entities: {
          categories: "categorías",
          stages: "etapas",
        },
      },
    },
    theme: {
      dark: "Oscuro",
      label: "Tema",
      light: "Claro",
      system: "Sistema",
    },
    language: "Idioma",
    navigation: {
      label: "Navegación del CRM",
    },
    profile: {
      inbound: {
        description:
          "Puedes comenzar a enviar correos a la dirección de correo entrante de tu servidor, por ejemplo agregándola al campo %{field}. Neon CRM procesará los correos y agregará notas a los contactos correspondientes.",
        title: "Correo entrante",
      },
      mcp: {
        title: "Servidor MCP",
        description:
          "Usa esta URL para conectar tu asistente de IA a los datos de tu CRM mediante el Protocolo de Contexto de Modelos (MCP).",
      },
      password: {
        change: "Cambiar contraseña",
      },
      password_reset_sent:
        "Se envió un correo de restablecimiento de contraseña a tu dirección",
      record_not_found: "Registro no encontrado",
      title: "Mi perfil",
      updated: "Tu perfil ha sido actualizado",
      update_error: "Ocurrió un error. Por favor intenta de nuevo",
    },
    validation: {
      invalid_url: "Debe ser una URL válida",
      invalid_linkedin_url: "La URL debe ser de linkedin.com",
    },
  },
};
