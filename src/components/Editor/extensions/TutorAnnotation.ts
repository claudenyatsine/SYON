import { Mark, mergeAttributes } from '@tiptap/core';

export interface TutorAnnotationOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tutorAnnotation: {
      setTutorAnnotation: (attributes: { id: string; type: string; replacementText?: string }) => ReturnType;
      toggleTutorAnnotation: (attributes: { id: string; type: string; replacementText?: string }) => ReturnType;
      unsetTutorAnnotation: () => ReturnType;
    };
  }
}

export const TutorAnnotation = Mark.create<TutorAnnotationOptions>({
  name: 'tutorAnnotation',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'tutor-annotation',
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-annotation-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-annotation-id': attributes.id,
          };
        },
      },
      type: {
        default: 'default',
        parseHTML: element => element.getAttribute('data-annotation-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {};
          }
          return {
            'data-annotation-type': attributes.type,
          };
        },
      },
      replacementText: {
        default: null,
        parseHTML: element => element.getAttribute('data-annotation-replacement'),
        renderHTML: attributes => {
          if (!attributes.replacementText) {
            return {};
          }
          return {
            'data-annotation-replacement': attributes.replacementText,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-annotation-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTutorAnnotation:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleTutorAnnotation:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetTutorAnnotation:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
