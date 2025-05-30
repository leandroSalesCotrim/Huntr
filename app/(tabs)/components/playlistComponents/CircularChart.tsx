import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularChartProps {
  percentual: number; // Percentual para preencher o gráfico
  tamanho?: number; // Tamanho do gráfico (largura e altura)
  largura?: number; // Largura do traçado do gráfico
}

const CircularChart: React.FC<CircularChartProps> = ({
  percentual,
  tamanho = 100,
  largura = 10,
}) => {
  const raio = (tamanho - largura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchimento = (percentual / 100) * circunferencia;

  return (
    <View style={[styles.container, { width: tamanho, height: tamanho }]}>

      <View style={styles.chartBox}>
        <Svg width={tamanho} height={tamanho}>
          <Circle
            stroke="white" // Cor do fundo
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            strokeWidth={largura}
            fill="transparent"
          />
          <Circle
            stroke="#57B3FF" // Cor do preenchimento
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            strokeWidth={largura}
            strokeDasharray={`${circunferencia} ${circunferencia}`}
            strokeDashoffset={circunferencia - preenchimento}
            strokeLinecap="round"
            rotation="90"
            originX={tamanho / 2}
            originY={tamanho / 2}
            fill="transparent"
          />
        </Svg>
        <Text style={styles.percentualTexto}>{`${percentual}%`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartBox: {
    height: "100%",
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentualTexto: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CFCFCF',
  },
});

export default CircularChart;
