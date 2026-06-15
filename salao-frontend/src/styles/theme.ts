import type { CSSProperties } from 'react';

export const th: CSSProperties = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#8B6E63',
  letterSpacing: 1,
  textTransform: 'uppercase',
};

export const td: CSSProperties = {
  padding: '14px 20px',
  fontSize: 14,
  color: '#3D2B1F',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #E8D5CC',
  borderRadius: 8,
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  color: '#3D2B1F',
  backgroundColor: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#8B6E63',
  marginBottom: 6,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};

export const card: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  border: '1px solid #F0E6DC',
};

export const modalOverlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(61,43,31,0.5)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const modalBox: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 32,
  width: '90%',
  maxWidth: 480,
  boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
};

export const btnPrimary: CSSProperties = {
  backgroundColor: '#C97B6B',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '10px 32px',
  cursor: 'pointer',
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  fontWeight: 700,
};

export const btnNew: CSSProperties = {
  backgroundColor: '#C97B6B',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  cursor: 'pointer',
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  fontWeight: 700,
};

export const btnCancel: CSSProperties = {
  backgroundColor: 'transparent',
  color: '#C97B6B',
  border: '1px solid #C97B6B',
  borderRadius: 8,
  padding: '10px 32px',
  cursor: 'pointer',
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  fontWeight: 600,
};

export const btnEdit: CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid #C97B6B',
  color: '#C97B6B',
  borderRadius: 6,
  padding: '6px 16px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  marginRight: 8,
};

export const btnDelete: CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid #F0E6DC',
  color: '#8B6E63',
  borderRadius: 6,
  padding: '6px 16px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
};

export const badge = (ativo: boolean): CSSProperties => ({
  display: 'inline-block',
  backgroundColor: ativo ? '#D4EDDA' : '#F8D7DA',
  color: ativo ? '#2D6A4F' : '#721C24',
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
});

export const pageTitle: CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontSize: 28,
  color: '#3D2B1F',
  margin: 0,
};

export const pageSubtitle: CSSProperties = {
  color: '#8B6E63',
  fontSize: 14,
  marginTop: 4,
  marginBottom: 0,
};

export const erroBanner: CSSProperties = {
  color: '#721C24',
  fontSize: 13,
  marginBottom: 16,
  backgroundColor: '#F8D7DA',
  padding: '10px 14px',
  borderRadius: 8,
};

export const sectionTitle: CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontSize: 16,
  color: '#C97B6B',
  marginBottom: 16,
  marginTop: 8,
  borderBottom: '1px solid #F0E6DC',
  paddingBottom: 8,
};
