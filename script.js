class Ficha {
  constructor(ladoA, ladoB) {
    this.ladoA = ladoA;
    this.ladoB = ladoB;
  }

  esCompatible(numero) {
    return this.ladoA === numero || this.ladoB === numero;
  }

  invertir() {
    [this.ladoA, this.ladoB] = [this.ladoB, this.ladoA];
  }

  toString() {
    return `[${this.ladoA}|${this.ladoB}]`;
  }
}

class JuegoDomino {
  constructor() {
    this.fichas = this.generarFichas();
    this.mesa = [];
    this.jugadores = [[], []];
    this.turno = 0;
    this.pasesConsecutivos = 0;
    this.repartirFichas();
    this.render();
  }

  generarFichas() {
    const fichas = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        fichas.push(new Ficha(i, j));
      }
    }
    return fichas.sort(() => Math.random() - 0.5);
  }

  repartirFichas() {
    for (let i = 0; i < 7; i++) {
      this.jugadores[0].push(this.fichas.pop());
      this.jugadores[1].push(this.fichas.pop());
    }
  }

  colocarFicha(jugadorIndex, fichaIndex) {
    const ficha = this.jugadores[jugadorIndex][fichaIndex];
    const extremoIzq = this.mesa[0]?.ladoA;
    const extremoDer = this.mesa[this.mesa.length - 1]?.ladoB;

    if (this.mesa.length === 0) {
      this.mesa.push(ficha);
      this.jugadores[jugadorIndex].splice(fichaIndex, 1);
      return true;
    }

    if (ficha.esCompatible(extremoIzq)) {
      if (ficha.ladoB === extremoIzq) ficha.invertir();
      this.mesa.unshift(ficha);
      this.jugadores[jugadorIndex].splice(fichaIndex, 1);
      return true;
    }

    if (ficha.esCompatible(extremoDer)) {
      if (ficha.ladoA === extremoDer) ficha.invertir();
      this.mesa.push(ficha);
      this.jugadores[jugadorIndex].splice(fichaIndex, 1);
      return true;
    }

    return false;
  }

  puedeJugar(jugadorIndex) {
    const extremoIzq = this.mesa[0]?.ladoA;
    const extremoDer = this.mesa[this.mesa.length - 1]?.ladoB;
    const fichas = this.jugadores[jugadorIndex];

    if (this.mesa.length === 0) return true;

    return fichas.some(f =>
      f.esCompatible(extremoIzq) || f.esCompatible(extremoDer)
    );
  }

  intentarColocar(jugadorIndex, fichaIndex) {
    if (jugadorIndex !== this.turno || this.turno === -1) return;

    if (!this.puedeJugar(jugadorIndex)) {
      alert("Jugador 1 no puede jugar y pasa el turno.");
      this.pasesConsecutivos++;
      this.turno = 1;
      this.render();
      this.verificarBloqueo();
      setTimeout(() => this.turnoIA(), 1000);
      return;
    }

    const pudo = this.colocarFicha(jugadorIndex, fichaIndex);
    if (pudo) {
      this.pasesConsecutivos = 0;
      this.turno = 1;
      this.render();
      setTimeout(() => this.turnoIA(), 1000);
    } else {
      alert("Esa ficha no se puede colocar.");
    }
  }

  turnoIA() {
    if (this.turno !== 1 || this.turno === -1) return;

    const jugadorIndex = 1;
    const fichas = this.jugadores[jugadorIndex];

    if (!this.puedeJugar(jugadorIndex)) {
      alert("Jugador 2 (IA) no puede jugar y pasa el turno.");
      this.pasesConsecutivos++;
      this.turno = 0;
      this.render();
      this.verificarBloqueo();
      return;
    }

    for (let i = 0; i < fichas.length; i++) {
      if (this.colocarFicha(jugadorIndex, i)) {
        this.pasesConsecutivos = 0;
        this.turno = 0;
        this.render();
        return;
      }
    }

    alert("Jugador 2 (IA) pasa el turno.");
    this.pasesConsecutivos++;
    this.turno = 0;
    this.render();
    this.verificarBloqueo();
  }

  verificarBloqueo() {
    if (this.pasesConsecutivos >= 2) {
      alert("🔒 El juego está bloqueado. Se calcularán los puntajes.");
      this.calcularPuntajes();
      this.turno = -1;
    }
  }

  calcularPuntajes() {
    const puntajes = this.jugadores.map(jugador =>
      jugador.reduce((acc, ficha) => acc + ficha.ladoA + ficha.ladoB, 0)
    );

    const mensaje = `🏁 Puntajes finales:\nJugador 1: ${puntajes[0]}\nJugador 2 (IA): ${puntajes[1]}`;
    alert(mensaje);

    if (puntajes[0] < puntajes[1]) {
      alert("🎉 ¡Jugador 1 gana por menor puntaje!");
    } else if (puntajes[1] < puntajes[0]) {
      alert("🤖 ¡La IA gana por menor puntaje!");
    } else {
      alert("🤝 ¡Empate!");
    }
  }

  verificarVictoria() {
    if (this.jugadores[0].length === 0) {
      alert("🎉 ¡Jugador 1 ha ganado!");
      this.turno = -1;
    } else if (this.jugadores[1].length === 0) {
      alert("🤖 ¡La IA ha ganado!");
      this.turno = -1;
    }
  }

  render() {
    const mesaDiv = document.getElementById("mesa");
    const jugador1Div = document.getElementById("jugador1");
    const jugador2Div = document.getElementById("jugador2");
    const turnoBtn = document.getElementById("turnoBtn");

    mesaDiv.innerHTML = this.mesa.map(f => this.renderFicha(f)).join("");
    jugador1Div.innerHTML = this.jugadores[0]
      .map((f, i) => this.renderBotonFicha(f, 0, i))
      .join("");
    jugador2Div.innerHTML = this.jugadores[1]
      .map(f => this.renderFicha(f))
      .join("");

    turnoBtn.textContent = this.turno === -1
      ? "Juego terminado"
      : `Turno: Jugador ${this.turno + 1}`;

    this.verificarVictoria();
  }

  renderFicha(ficha) {
    return `<div class="bg-gray-700 px-2 py-1 rounded">${ficha.toString()}</div>`;
  }

  renderBotonFicha(ficha, jugadorIndex, fichaIndex) {
    const disabled = jugadorIndex !== this.turno || this.turno === -1
      ? "opacity-50 cursor-not-allowed"
      : "";
    return `<button 
      class="bg-green-600 hover:bg-green-700 px-2 py-1 rounded ${disabled}" 
      onclick="juego.intentarColocar(${jugadorIndex}, ${fichaIndex})"
      ${disabled ? "disabled" : ""}
    >
      ${ficha.toString()}
    </button>`;
  }
}

const juego = new JuegoDomino();
const turnoBtn = document.getElementById("turnoBtn");
turnoBtn.addEventListener("click", () => {
  if (juego.turno === 1) {
    juego.turnoIA();
  }
});