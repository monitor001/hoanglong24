export const getResponsiveChartOptions = (isMobile: boolean, isDarkTheme: boolean = false) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: isMobile ? 15 : 20,
        right: isMobile ? 8 : 10,
        bottom: isMobile ? 8 : 10,
        left: isMobile ? 8 : 10
      }
    },
    plugins: {
      legend: {
        position: (isMobile ? 'bottom' : 'left') as 'bottom' | 'left',
        align: 'start' as const,
        labels: {
          padding: isMobile ? 10 : 15,
          font: {
            size: isMobile ? 12 : 13,
            weight: 'bold' as const,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          },
          // Better color handling for dark theme
          color: isDarkTheme ? '#e8e8e8' : '#1a1a1a',
          usePointStyle: true,
          pointStyle: 'circle',
          textAlign: 'left' as const,
        },
        onHover: (event: any, legendItem: any) => {
          event.native.target.style.cursor = 'pointer';
        },
        onLeave: (event: any, legendItem: any) => {
          event.native.target.style.cursor = 'default';
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDarkTheme ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkTheme ? '#e8e8e8' : '#1a1a1a',
        bodyColor: isDarkTheme ? '#e8e8e8' : '#1a1a1a',
        borderColor: isDarkTheme ? '#434343' : '#d9d9d9',
        borderWidth: 1,
        titleFont: {
          size: isMobile ? 11 : 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: isMobile ? 10 : 12
        },
        padding: isMobile ? 8 : 10,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        // Better color handling for dark theme
        color: isDarkTheme ? '#ffffff' : '#000000',
        font: {
          size: isMobile ? 10 : 12,
          weight: 'bold' as const,
        },
        formatter: (value: number, context: any) => {
          const dataset = context.dataset;
          const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${percentage}%`;
        },
        anchor: 'center' as const,
        align: 'center' as const,
        offset: 0,
        clamp: true,
        display: (context: any) => {
          const value = context.dataset.data[context.dataIndex];
          return value > 0;
        }
      }
    }
  };
};

export const getResponsiveBarChartOptions = (isMobile: boolean, isDarkTheme: boolean = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as 'bottom',
      labels: {
        padding: isMobile ? 6 : 8,
        font: {
          size: isMobile ? 9 : 10
        },
        // Better color handling for dark theme
        color: isDarkTheme ? '#e8e8e8' : '#1a1a1a',
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: isDarkTheme ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      titleColor: isDarkTheme ? '#e8e8e8' : '#1a1a1a',
      bodyColor: isDarkTheme ? '#e8e8e8' : '#1a1a1a',
      borderColor: isDarkTheme ? '#434343' : '#d9d9d9',
      titleFont: {
        size: isMobile ? 10 : 12
      },
      bodyFont: {
        size: isMobile ? 9 : 11
      },
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.parsed || context.raw || 0;
          return `${label}: ${value}`;
        }
      }
    },
  },
});

export const getResponsiveChartHeight = (isMobile: boolean, isTablet: boolean): number => {
  if (isMobile) return 300; // Tăng height cho mobile để biểu đồ hiển thị rõ hơn
  if (isTablet) return 320;
  return 350;
}; 