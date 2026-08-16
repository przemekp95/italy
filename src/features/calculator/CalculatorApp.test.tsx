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
    await user.click(screen.getByRole('combobox', { name: /mensilità/i }));
    await user.click(screen.getByRole('option', { name: '13' }));
    await user.click(screen.getByRole('button', { name: 'Calcola' }));

    const result = screen.getByRole('region', { name: /risultato/i });
    expect(
      within(result).getAllByText(/netto annuo stimato/i),
    ).not.toHaveLength(0);
    expect(
      within(result).getByText(/media netta per mensilità/i),
    ).toBeInTheDocument();
    expect(
      within(result).getByText(/contributi sociali totali/i),
    ).toBeInTheDocument();
    expect(within(result).getByText(/imposte totali/i)).toBeInTheDocument();
    expect(within(result).getByText(/trattenute totali/i)).toBeInTheDocument();
    expect(screen.getByText(/come abbiamo calcolato/i)).toBeInTheDocument();
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
    expect(
      screen.getByRole('button', { name: 'Calculate' }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('accepts localized thousands separators shown by the UI', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    const input = screen.getByRole('textbox', {
      name: /retribuzione annua lorda/i,
    });
    await user.type(input, '40.000');
    await user.click(screen.getByRole('button', { name: 'Calcola' }));
    expect(screen.getByTestId('annual-net')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'English' }));
    await user.clear(
      screen.getByRole('textbox', { name: /annual gross salary/i }),
    );
    await user.type(
      screen.getByRole('textbox', { name: /annual gross salary/i }),
      '40,000',
    );
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByTestId('annual-net')).toBeInTheDocument();
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

  it('offers a keyboard-operable custom pay-period list', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    const combobox = screen.getByRole('combobox', { name: /mensilità/i });
    combobox.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox', { name: /mensilità/i })).toBeVisible();
    await user.keyboard('{End}{Enter}');
    expect(combobox).toHaveTextContent('14');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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
