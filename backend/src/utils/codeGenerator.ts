/**
 * Utility functions for generating unique codes for projects and tasks
 */

export function generateProjectCode(name: string): string {
  const prefix = 'PRJ';
  const timestamp = Date.now().toString().slice(-6);
  const nameCode = name
    .replace(/[^A-Za-z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase();
  return `${prefix}-${nameCode}-${timestamp}`;
}

export function generateTaskCode(title: string, projectCode?: string): string {
  const prefix = 'TASK';
  const timestamp = Date.now().toString().slice(-6);
  const titleCode = title
    .replace(/[^A-Za-z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase();
  const projectShortCode = projectCode ? projectCode.split('-')[1] : 'GEN';
  return `${prefix}-${projectShortCode}-${titleCode}-${timestamp}`;
}

export function generateIssueCode(type: string = 'ISSUE'): string {
  const prefix = type === 'RFI' ? 'RFI' : 'ISS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${random}-${timestamp}`;
} 