import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calcularEnvio,
    validarCodigoPostal
} from '../src/recursos/js/carrito.js';

// TESTS DE CALCULAR ENVÍO

// test("El envío a Córdoba cuesta $3500", () => {
//     assert.equal(calcularEnvio("cordoba", 50000), 3500);
// });

test("El envío a Córdoba cuesta $3500", () => {
    assert.equal(calcularEnvio("cordoba", 50000), 9999);
});

test("El envío a Buenos Aires cuesta $5500", () => {
    assert.equal(calcularEnvio("buenos-aires", 50000), 5500);
});

test("El envío a CABA cuesta $5500", () => {
    assert.equal(calcularEnvio("caba", 50000), 5500);
});

test("El envío al resto del país cuesta $7000", () => {
    assert.equal(calcularEnvio("mendoza", 50000), 7000);
});

test("El envío es gratis desde $150000", () => {
    assert.equal(calcularEnvio("cordoba", 150000), 0);
});

test("El envío de un carrito vacío cuesta $0", () => {
    assert.equal(calcularEnvio("cordoba", 0), 0);
});

// TESTS DE VALIDAR CÓDIGO POSTAL

test("Un código postal de cuatro números es válido", () => {
    assert.equal(validarCodigoPostal("5000"), true);
});

test("Un código postal con letras es inválido", () => {
    assert.equal(validarCodigoPostal("ABCD"), false);
});

test("Un código postal de tres números es inválido", () => {
    assert.equal(validarCodigoPostal("500"), false);
});

test("Un código postal de cinco números es inválido", () => {
    assert.equal(validarCodigoPostal("50000"), false);
});

test("Un código postal vacío es inválido", () => {
    assert.equal(validarCodigoPostal(""), false);
});