import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { theme } from 'antd';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  isDarkMode?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  readOnly = false,
  isDarkMode = false
}) => {
  const { token } = theme.useToken();

  // Quill modules to attach to editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  // Quill editor formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  const editorStyle = {
    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
    borderRadius: '6px',
    minHeight: '200px',
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          .ql-editor {
            background-color: ${isDarkMode ? '#1f1f1f' : '#fff'} !important;
            color: ${isDarkMode ? '#fff' : '#000'} !important;
            min-height: 200px;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .ql-toolbar {
            background-color: ${isDarkMode ? '#262626' : '#fafafa'} !important;
            border-color: ${isDarkMode ? '#303030' : '#d9d9d9'} !important;
          }
          
          .ql-toolbar button {
            color: ${isDarkMode ? '#fff' : '#000'} !important;
          }
          
          .ql-toolbar button:hover {
            color: ${token.colorPrimary} !important;
          }
          
          .ql-toolbar .ql-active {
            color: ${token.colorPrimary} !important;
          }
          
          .ql-stroke {
            stroke: ${isDarkMode ? '#fff' : '#000'} !important;
          }
          
          .ql-fill {
            fill: ${isDarkMode ? '#fff' : '#000'} !important;
          }
          
          .ql-picker {
            color: ${isDarkMode ? '#fff' : '#000'} !important;
          }
          
          .ql-picker-options {
            background-color: ${isDarkMode ? '#262626' : '#fff'} !important;
            border-color: ${isDarkMode ? '#303030' : '#d9d9d9'} !important;
          }
          
          .ql-picker-item {
            color: ${isDarkMode ? '#fff' : '#000'} !important;
          }
          
          .ql-picker-item:hover {
            background-color: ${isDarkMode ? '#404040' : '#f5f5f5'} !important;
          }
          
          .ql-picker-label {
            color: ${isDarkMode ? '#fff' : '#000'} !important;
          }
          
          .ql-container {
            border-color: ${isDarkMode ? '#303030' : '#d9d9d9'} !important;
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
          }
        `}
      </style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={editorStyle}
      />
    </div>
  );
};

export default RichTextEditor; 