const { DataTypes } = require('sequelize');

const sequelizeModels = [
   {
      modelName: 'Song',
      attributes: {
         artists: {
            type: DataTypes.STRING(2048),
            allowNull: true,
            defaultValue: '{}',
            unique: false,
         },
         availableMarkets: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '{}',
            unique: false,
         },
         disc_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            unique: false,
         },
         duration_ms: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            unique: false,
         },
         explicit: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            unique: false,
         },
         external_urls: {
            type: DataTypes.STRING(2048),
            allowNull: true,
            defaultValue: '{}',
            unique: false,
         },
         href: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         uuid: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         is_local: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            unique: false,
         },
         name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         preview_url: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         track_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            unique: false,
         },
         type: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         uri: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: '',
            unique: false,
         }
      },
      options: {
         tableName: 'songs'
      },
   },
   {
      modelName: 'Artist',
      attributes: {
         external_urls: {
            type: DataTypes.STRING(2048),
            allowNull: true,
            defaultValue: '{}',
            unique: false,
         },
         href: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         uuid: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         type: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         uri: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
      },
      options: {
         tableName: 'artists'
      },
   },
   {
      modelName: 'SongArtist',
      attributes: {
         songUuid: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
         artistUuid: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
            unique: false,
         },
      },
      options: {
         tableName: 'songs-artists'
      },
   }
];

module.exports = sequelizeModels;
