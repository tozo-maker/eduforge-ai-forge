
// Simple i18n implementation for EduForge
import { useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

export interface TranslationDictionary {
  [key: string]: string;
}

export type Translations = {
  [lang in Language]: TranslationDictionary;
};

// Initial translations (minimal set for demo)
export const translations: Translations = {
  en: {
    // General
    'app.title': 'EduForge AI',
    'app.description': 'Educational Content Creation Platform',
    'app.welcome': 'Welcome to EduForge AI',
    'app.dashboard': 'Dashboard',
    'app.projects': 'Projects',
    'app.content': 'Content',
    'app.analytics': 'Analytics',
    'app.settings': 'Settings',
    
    // Project creation
    'project.create': 'Create New Project',
    'project.name': 'Project Name',
    'project.description': 'Project Description',
    'project.type': 'Project Type',
    'project.template.select': 'Choose a template to get started',
    'project.config': 'Configure your project settings',
    'project.subject': 'Subject',
    'project.gradeLevel': 'Grade Level',
    'project.objectives': 'Learning Objectives',
    'project.standards': 'Educational Standards',
    'project.structure': 'Content Structure',
    'project.language': 'Language & Accessibility',
    'project.ai.profile': 'AI Profile',
    'project.suggestions': 'Complementary Subject Areas',
    
    // Buttons & Actions
    'button.create': 'Create',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.next': 'Next',
    'button.previous': 'Previous',
    'button.generate': 'Generate',
    'button.add': 'Add',
    'button.remove': 'Remove',
    
    // Language settings
    'language.readability': 'Readability Level',
    'language.cultural': 'Cultural Context',
    'language.terminology': 'Terminology Level',
    'language.sample.topic': 'Sample Topic',
    'language.sample.generate': 'Generate Sample',
    'language.sample.result': 'Language Sample',
  },
  es: {
    // General
    'app.title': 'EduForge AI',
    'app.description': 'Plataforma de Creación de Contenido Educativo',
    'app.welcome': 'Bienvenido a EduForge AI',
    'app.dashboard': 'Panel',
    'app.projects': 'Proyectos',
    'app.content': 'Contenido',
    'app.analytics': 'Análisis',
    'app.settings': 'Configuración',
    
    // Project creation
    'project.create': 'Crear Nuevo Proyecto',
    'project.name': 'Nombre del Proyecto',
    'project.description': 'Descripción del Proyecto',
    'project.type': 'Tipo de Proyecto',
    'project.template.select': 'Elige una plantilla para comenzar',
    'project.config': 'Configura los ajustes de tu proyecto',
    'project.subject': 'Asignatura',
    'project.gradeLevel': 'Nivel de Grado',
    'project.objectives': 'Objetivos de Aprendizaje',
    'project.standards': 'Estándares Educativos',
    'project.structure': 'Estructura de Contenido',
    'project.language': 'Idioma y Accesibilidad',
    'project.ai.profile': 'Perfil de IA',
    'project.suggestions': 'Áreas Temáticas Complementarias',
    
    // Buttons & Actions
    'button.create': 'Crear',
    'button.save': 'Guardar',
    'button.cancel': 'Cancelar',
    'button.next': 'Siguiente',
    'button.previous': 'Anterior',
    'button.generate': 'Generar',
    'button.add': 'Añadir',
    'button.remove': 'Eliminar',
    
    // Language settings
    'language.readability': 'Nivel de Legibilidad',
    'language.cultural': 'Contexto Cultural',
    'language.terminology': 'Nivel de Terminología',
    'language.sample.topic': 'Tema de Ejemplo',
    'language.sample.generate': 'Generar Ejemplo',
    'language.sample.result': 'Ejemplo de Idioma',
  },
  fr: {
    // General
    'app.title': 'EduForge AI',
    'app.description': 'Plateforme de Création de Contenu Éducatif',
    'app.welcome': 'Bienvenue sur EduForge AI',
    'app.dashboard': 'Tableau de Bord',
    'app.projects': 'Projets',
    'app.content': 'Contenu',
    'app.analytics': 'Analytique',
    'app.settings': 'Paramètres',
    
    // Project creation
    'project.create': 'Créer un Nouveau Projet',
    'project.name': 'Nom du Projet',
    'project.description': 'Description du Projet',
    'project.type': 'Type de Projet',
    'project.template.select': 'Choisissez un modèle pour commencer',
    'project.config': 'Configurez les paramètres de votre projet',
    'project.subject': 'Matière',
    'project.gradeLevel': 'Niveau Scolaire',
    'project.objectives': 'Objectifs d\'Apprentissage',
    'project.standards': 'Normes Éducatives',
    'project.structure': 'Structure du Contenu',
    'project.language': 'Langue et Accessibilité',
    'project.ai.profile': 'Profil IA',
    'project.suggestions': 'Domaines Complémentaires',
    
    // Buttons & Actions
    'button.create': 'Créer',
    'button.save': 'Enregistrer',
    'button.cancel': 'Annuler',
    'button.next': 'Suivant',
    'button.previous': 'Précédent',
    'button.generate': 'Générer',
    'button.add': 'Ajouter',
    'button.remove': 'Supprimer',
    
    // Language settings
    'language.readability': 'Niveau de Lisibilité',
    'language.cultural': 'Contexte Culturel',
    'language.terminology': 'Niveau de Terminologie',
    'language.sample.topic': 'Sujet d\'exemple',
    'language.sample.generate': 'Générer un Exemple',
    'language.sample.result': 'Exemple de Langue',
  },
  de: {
    // General
    'app.title': 'EduForge AI',
    'app.description': 'Plattform zur Erstellung von Bildungsinhalten',
    'app.welcome': 'Willkommen bei EduForge AI',
    'app.dashboard': 'Dashboard',
    'app.projects': 'Projekte',
    'app.content': 'Inhalt',
    'app.analytics': 'Analytik',
    'app.settings': 'Einstellungen',
    
    // Project creation
    'project.create': 'Neues Projekt erstellen',
    'project.name': 'Projektname',
    'project.description': 'Projektbeschreibung',
    'project.type': 'Projekttyp',
    'project.template.select': 'Wählen Sie eine Vorlage, um zu beginnen',
    'project.config': 'Konfigurieren Sie Ihre Projekteinstellungen',
    'project.subject': 'Fach',
    'project.gradeLevel': 'Klassenstufe',
    'project.objectives': 'Lernziele',
    'project.standards': 'Bildungsstandards',
    'project.structure': 'Inhaltsstruktur',
    'project.language': 'Sprache und Barrierefreiheit',
    'project.ai.profile': 'KI-Profil',
    'project.suggestions': 'Ergänzende Fachgebiete',
    
    // Buttons & Actions
    'button.create': 'Erstellen',
    'button.save': 'Speichern',
    'button.cancel': 'Abbrechen',
    'button.next': 'Weiter',
    'button.previous': 'Zurück',
    'button.generate': 'Generieren',
    'button.add': 'Hinzufügen',
    'button.remove': 'Entfernen',
    
    // Language settings
    'language.readability': 'Lesbarkeitsniveau',
    'language.cultural': 'Kultureller Kontext',
    'language.terminology': 'Terminologiestufe',
    'language.sample.topic': 'Beispielthema',
    'language.sample.generate': 'Beispiel generieren',
    'language.sample.result': 'Sprachbeispiel',
  },
  zh: {
    // General
    'app.title': 'EduForge AI',
    'app.description': '教育内容创建平台',
    'app.welcome': '欢迎使用 EduForge AI',
    'app.dashboard': '仪表板',
    'app.projects': '项目',
    'app.content': '内容',
    'app.analytics': '分析',
    'app.settings': '设置',
    
    // Project creation
    'project.create': '创建新项目',
    'project.name': '项目名称',
    'project.description': '项目描述',
    'project.type': '项目类型',
    'project.template.select': '选择模板开始',
    'project.config': '配置项目设置',
    'project.subject': '学科',
    'project.gradeLevel': '年级水平',
    'project.objectives': '学习目标',
    'project.standards': '教育标准',
    'project.structure': '内容结构',
    'project.language': '语言和可访问性',
    'project.ai.profile': 'AI 配置文件',
    'project.suggestions': '互补学科领域',
    
    // Buttons & Actions
    'button.create': '创建',
    'button.save': '保存',
    'button.cancel': '取消',
    'button.next': '下一步',
    'button.previous': '上一步',
    'button.generate': '生成',
    'button.add': '添加',
    'button.remove': '移除',
    
    // Language settings
    'language.readability': '可读性级别',
    'language.cultural': '文化背景',
    'language.terminology': '术语级别',
    'language.sample.topic': '示例主题',
    'language.sample.generate': '生成示例',
    'language.sample.result': '语言示例',
  },
  ja: {
    // General
    'app.title': 'EduForge AI',
    'app.description': '教育コンテンツ作成プラットフォーム',
    'app.welcome': 'EduForge AI へようこそ',
    'app.dashboard': 'ダッシュボード',
    'app.projects': 'プロジェクト',
    'app.content': 'コンテンツ',
    'app.analytics': '分析',
    'app.settings': '設定',
    
    // Project creation
    'project.create': '新しいプロジェクトを作成',
    'project.name': 'プロジェクト名',
    'project.description': 'プロジェクトの説明',
    'project.type': 'プロジェクトタイプ',
    'project.template.select': 'テンプレートを選んで始める',
    'project.config': 'プロジェクト設定を構成する',
    'project.subject': '教科',
    'project.gradeLevel': '学年',
    'project.objectives': '学習目標',
    'project.standards': '教育基準',
    'project.structure': 'コンテンツ構造',
    'project.language': '言語とアクセシビリティ',
    'project.ai.profile': 'AIプロファイル',
    'project.suggestions': '補完的な科目領域',
    
    // Buttons & Actions
    'button.create': '作成',
    'button.save': '保存',
    'button.cancel': 'キャンセル',
    'button.next': '次へ',
    'button.previous': '前へ',
    'button.generate': '生成',
    'button.add': '追加',
    'button.remove': '削除',
    
    // Language settings
    'language.readability': '可読性レベル',
    'language.cultural': '文化的文脈',
    'language.terminology': '専門用語レベル',
    'language.sample.topic': 'サンプルトピック',
    'language.sample.generate': 'サンプルを生成',
    'language.sample.result': '言語サンプル',
  },
  ar: {
    // General
    'app.title': 'EduForge AI',
    'app.description': 'منصة إنشاء المحتوى التعليمي',
    'app.welcome': 'مرحبًا بك في EduForge AI',
    'app.dashboard': 'لوحة التحكم',
    'app.projects': 'المشاريع',
    'app.content': 'المحتوى',
    'app.analytics': 'التحليلات',
    'app.settings': 'الإعدادات',
    
    // Project creation
    'project.create': 'إنشاء مشروع جديد',
    'project.name': 'اسم المشروع',
    'project.description': 'وصف المشروع',
    'project.type': 'نوع المشروع',
    'project.template.select': 'اختر قالبًا للبدء',
    'project.config': 'تكوين إعدادات المشروع',
    'project.subject': 'المادة',
    'project.gradeLevel': 'المستوى الدراسي',
    'project.objectives': 'أهداف التعلم',
    'project.standards': 'المعايير التعليمية',
    'project.structure': 'هيكل المحتوى',
    'project.language': 'اللغة وإمكانية الوصول',
    'project.ai.profile': 'ملف تعريف الذكاء الاصطناعي',
    'project.suggestions': 'مجالات الموضوعات التكميلية',
    
    // Buttons & Actions
    'button.create': 'إنشاء',
    'button.save': 'حفظ',
    'button.cancel': 'إلغاء',
    'button.next': 'التالي',
    'button.previous': 'السابق',
    'button.generate': 'إنشاء',
    'button.add': 'إضافة',
    'button.remove': 'إزالة',
    
    // Language settings
    'language.readability': 'مستوى القراءة',
    'language.cultural': 'السياق الثقافي',
    'language.terminology': 'مستوى المصطلحات',
    'language.sample.topic': 'موضوع العينة',
    'language.sample.generate': 'إنشاء عينة',
    'language.sample.result': 'عينة اللغة',
  }
};

// Create language context
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  
  useEffect(() => {
    // Try to get language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('eduforge-language');
    if (savedLanguage && isLanguage(savedLanguage)) {
      setCurrentLanguage(savedLanguage as Language);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (isLanguage(browserLang)) {
        setCurrentLanguage(browserLang as Language);
      }
    }
  }, []);
  
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('eduforge-language', language);
    document.documentElement.lang = language;
    
    // Handle RTL support for Arabic
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  };
  
  const t = (key: string): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };
  
  return { t, currentLanguage, changeLanguage };
};

// Type guard to check if a string is a valid Language
function isLanguage(lang: string): boolean {
  return ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'].includes(lang);
}
