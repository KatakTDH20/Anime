const app = Vue.createApp({
  data() {
      return {
          animes: [],
          busqueda: "",
          generos: [],
          generoSeleccionado: "Todos",
          cargando: false,
          error: "",
          progreso: 100,
          cantidad: 1,
      };
  },
  computed: {
      animesFiltrados() {
          let filtrados = this.animes;

          // Filtrar por género
          if (this.generoSeleccionado !== "Todos") {
              filtrados = filtrados.filter(anime =>
                  anime.genres.some(genre => genre.name === this.generoSeleccionado)
              );
          }

          // Filtrar por búsqueda
          if (this.busqueda) {
              filtrados = filtrados.filter(anime =>
                  anime.title.toLowerCase().includes(this.busqueda.toLowerCase())
              );
          }

          this.actualizarProgreso(filtrados.length, this.animes.length);

          return filtrados;
      },
  },
  mounted() {
      this.cargarAnimes();
  },
  methods: {
      async cargarAnimes() {
          this.cargando = true;
          this.error = "";
          try {
              const response = await axios.get("https://api.jikan.moe/v4/anime");
              this.animes = response.data.data;

              const generosUnicos = new Set();
              this.animes.forEach(anime =>
                  anime.genres.forEach(genre => generosUnicos.add(genre.name))
              );
              this.generos = Array.from(generosUnicos);

              this.progreso = 100;
          } catch (error) {
              console.error("Error al cargar los animes:", error);
              this.error = "No se pudo cargar el catálogo. Por favor, intenta más tarde.";
          } finally {
              this.cargando = false;
          }
      },
      incrementarCantidad() {
          if (this.cantidad < 6) {
              this.cantidad++;
          }
      },
      decrementarCantidad() {
          if (this.cantidad > 1) {
              this.cantidad--;
          }
      },
      filtrarPorGenero(genero) {
          this.generoSeleccionado = genero;
      },
      verMas(anime) {
          // Guardar los datos del anime seleccionado en localStorage
          const datosAnime = {
              title: anime.title,
              synopsis: anime.synopsis || "Sin sinopsis disponible.",
              episodes: anime.episodes || "Desconocido",
              score: anime.score || "N/A",
              genres: anime.genres.map(g => g.name).join(", "),
              image_url: anime.images.jpg.image_url,
              cantidad: this.cantidad,
          };
          localStorage.setItem("animeSeleccionado", JSON.stringify(datosAnime));

          // Redirigir a detalle.html
          window.location.href = "detalle.html";
      },
      actualizarProgreso(filtrados, total) {
          // Calcula el porcentaje basado en el número de animes filtrados
          this.progreso = total > 0 ? Math.round((filtrados / total) * 100) : 0;
      },
  },
});

app.mount("#app");


const det = Vue.createApp({
    data() {
        return {
            anime: null,
            cantidad: 1,
            precioDVD: 100,
            precioBluRay: 150,
            formatoSeleccionado: 'DVD',  // Valor por defecto
        };
    },
    computed: {
        precioTotal() {
            let precioUnitario = this.formatoSeleccionado === 'Blu-ray' ? this.precioBluRay : this.precioDVD;
            return (precioUnitario * this.cantidad).toFixed(2);
        }
    },
    mounted() {
        const data = JSON.parse(localStorage.getItem('animeSeleccionado'));
        if (data) {
            this.anime = data;
        }
    },
    methods: {
        incrementarCantidad() {
            if (this.cantidad < 6) {
                this.cantidad++;
            }
        },
        decrementarCantidad() {
            if (this.cantidad > 1) {
                this.cantidad--;
            }
        },
        agregarAlCarrito() {
            alert(`Se ha agregado ${this.cantidad} unidades de ${this.anime.title} en formato ${this.formatoSeleccionado} al carrito.`);
        }
    },
});

det.mount('#detalleAnime');

