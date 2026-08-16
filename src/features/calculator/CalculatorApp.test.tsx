import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalculatorApp } from './CalculatorApp';

describe('CalculatorApp', () => {
  it('calculates only after the explicit Italian CTA', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    expect(
      screen.getByRole('heading', { name: /stipendio netto a milano/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /risultato/i }),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByRole('textbox', { name: /retribuzione annua lorda/i }),
      '40000',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /mensilità/i }),
      '13',
    );
    await user.click(screen.getByRole('button', { name: 'Calcola' }));

    const result = screen.getByRole('region', { name: /risultato/i });
    expect(
      within(result).getByText(/netto annuo stimato/i),
    ).toBeInTheDocument();
    expect(
      within(result).getByText(/media netta per mensilità/i),
    ).toBeInTheDocument();
    expect(
      within(result).getByText(/contributi sociali totali/i),
    ).toBeInTheDocument();
    expect(within(result).getByText(/imposte totali/i)).toBeInTheDocument();
    expect(
      within(result).getByText(/detrazioni totali/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/come abbiamo calcolato/i),
    ).toBeInTheDocument();
  });

  it('supports the complete English UI', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(
      screen.getByRole('heading', { name: /net salary in milan/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /annual gross salary/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('is operable with the keyboard and moves focus to the result', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    const input = screen.getByRole('textbox', {
      name: /retribuzione annua lorda/i,
    });
    input.focus();
    await user.keyboard('30000');
    await user.tab();
    expect(screen.getByRole('combobox', { name: /mensilità/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Calcola' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('region', { name: /risultato/i })).toHaveFocus();
  });

  it('reports invalid input without attempting a calculation', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByRole('button', { name: 'Calcola' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /inserisci una ral maggiore di zero/i,
    );
  });
});
