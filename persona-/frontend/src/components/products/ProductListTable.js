
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import ExcelJS from "exceljs";
import '../../App.css';
//import { saveAs } from "file-saver";
const triggerDownload = (blob, filename) => {
  if (window.navigator?.msSaveOrOpenBlob) {
    // पुराने Edge IE-mode
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.style.display = 'none';
    a.href      = url;
    a.download  = filename;        // mobile Safari/Chrome यही पढ़ते हैं
    document.body.appendChild(a);
    a.click();                     // user-gesture के भीतर
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 800);
  }
};
// Helper functions
function getVirtualGroup(stockType, gender) {
  const st = (stockType || '').toLowerCase();
  const gen = (gender || '').toLowerCase();
  if (st === 'pu') {
    if (gen === 'ladies') return { group: 'PU LADIES', order: 7 };
    if (gen === 'kids_ladies') return { group: 'PU KID LADIES', order: 8 };
    if (gen === 'gents') return { group: 'PU GENTS', order: 9 };
    if (gen === 'kids_gents') return { group: 'PU KIDS GENTS', order: 10 };
    return { group: 'PU OTHER', order: 11 };
  }
  if (st === 'eva') {
    if (gen === 'ladies') return { group: 'EVA LADIES', order: 2 };
    if (gen === 'kids_ladies') return { group: 'EVA KID LADIES', order: 3 };
    if (gen === 'gents') return { group: 'EVA GENTS', order: 4 };
    if (gen === 'kids_gents') return { group: 'EVA KIDS GENTS', order: 5 };
    return { group: 'EVA OTHER', order: 6 };
  }
  return { group: 'OTHER', order: 99 };
}

function extractSeriesPref(series) {
  const match = (series || '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

const SearchBar = React.forwardRef(({ value, onChange, placeholder }, ref) => (
  <input
    ref={ref}
    type="text"
    className="prod-search"
    placeholder={placeholder || 'Search by any property…'}
    value={value}
    onChange={onChange}
  />
));
SearchBar.displayName = 'SearchBar';

const CheckboxFilter = ({
  label, options, selected, onChange, name, openFilter, setOpenFilter, dropdownMenuRef
}) => {
  const isOpen = openFilter === name;

  const handleCheckboxChange = (option) => {
    let updated;
    if (selected.includes(option)) {
      updated = selected.filter(item => item !== option);
    } else {
      updated = [...selected, option];
    }
    onChange(name, updated);
  };

  const handleAllChange = () => {
    onChange(name, []);
  };

  return (
    <div className="dropdown" style={{ maxWidth: 200, position: 'relative' }} data-bs-auto-close="false">
      <button
        className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
        type="button"
        onClick={() => setOpenFilter(isOpen ? null : name)}
      >
        {selected.length === 0 ? `All ${label}` : `${label} (${selected.length})`}
      </button>

      {isOpen && (
        <div className="dropdown-menu show w-100" style={{ maxHeight: 200, overflowY: 'auto' }} ref={dropdownMenuRef} >
          <div className="px-3 py-1">
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={selected.length === 0}
                onChange={handleAllChange}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="form-check-label">{`All ${label}`}</span>
            </label>
          </div>

          {options.map(option => (
            <div key={option} className="px-3 py-1">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selected.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="form-check-label">{option}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductListTable = ({ products, loading, title, onRefresh }) => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    size: [], color: [], gender: [],
    article: [], stockType: [], pairPerCarton: [],
    mrp: [], rate: [], series: []
  });
  const [matrixExportType, setMatrixExportType] = useState("withoutImage");
  const [pdfExportType, setPdfExportType] = useState("withImage");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [showMRP, setShowMRP] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const dropdownMenuRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!openFilter) return;

    function handleClickOutside(event) {
      if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilter]);

  // Keyboard shortcut: press / to focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Smart filtering for dropdown options
  const uniqueSizes = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.size)
        .filter(Boolean)
    )
  ];

  const uniqueColors = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.color)
        .filter(Boolean)
    )
  ];

  const uniqueGenders = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.gender)
        .filter(Boolean)
    )
  ];

  const uniqueArticles = [
    ...new Set(
      products
        .filter(p =>
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.article)
        .filter(Boolean)
    )
  ];

  const uniqueStockTypes = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.stockType)
        .filter(Boolean)
    )
  ];

  const uniquePairPerCartons = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.pairPerCarton)
        .filter(Boolean)
    )
  ];

  const uniqueMRPs = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.mrp)
        .filter(Boolean)
    )
  ];

  const uniqueRates = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.series.length === 0 || filter.series.includes(p.series)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp)))
        )
        .map(p => p.rate)
        .filter(Boolean)
    )
  ];

  const uniqueSeries = [
    ...new Set(
      products
        .filter(p =>
          (filter.article.length === 0 || filter.article.includes(p.article)) &&
          (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
          (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
          (filter.size.length === 0 || filter.size.includes(p.size)) &&
          (filter.color.length === 0 || filter.color.includes(p.color)) &&
          (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
          (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
          (filter.rate.length === 0 || filter.rate.includes(String(p.rate)))
        )
        .map(p => p.series)
        .filter(Boolean)
    )
  ];

  const groupedProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchesSearch = [
        p.article, p.stockType, p.gender, p.color, p.size, p.series,
        p.pairPerCarton?.toString(), p.createdBy, p.mrp?.toString(), p.rate?.toString()
      ].join(' ').toLowerCase().includes(search.toLowerCase());

      const matchesFilters =
        (filter.size.length === 0 || filter.size.includes(p.size)) &&
        (filter.color.length === 0 || filter.color.includes(p.color)) &&
        (filter.gender.length === 0 || filter.gender.includes(p.gender)) &&
        (filter.article.length === 0 || filter.article.includes(p.article)) &&
        (filter.stockType.length === 0 || filter.stockType.includes(p.stockType)) &&
        (filter.pairPerCarton.length === 0 || filter.pairPerCarton.includes(String(p.pairPerCarton))) &&
        (filter.mrp.length === 0 || filter.mrp.includes(String(p.mrp))) &&
        (filter.rate.length === 0 || filter.rate.includes(String(p.rate))) &&
        (filter.series.length === 0 || filter.series.includes(p.series));
      return matchesSearch && matchesFilters;
    });

    const groups = {};
    filtered.forEach(product => {
      const key = `${product.article}-${product.gender}`;
      if (!groups[key]) {
        groups[key] = {
          article: product.article,
          gender: product.gender,
          image: null,
          variants: []
        };
      }
      if (!groups[key].image && product.image) {
        groups[key].image = product.image;
      }
      groups[key].variants.push(product);
    });
    return groups;
  }, [products, search, filter]);

  const filteredProducts = useMemo(() => {
    return Object.values(groupedProducts).flatMap(group => group.variants);
  }, [groupedProducts]);

  const handleFilterChange = (name, value) => setFilter(prev => ({ ...prev, [name]: value }));
  const handleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const handleSelectAll = () => setSelected(prev => prev.length === filteredProducts.length ? [] : filteredProducts.map(p => p._id));

  const getImageBase64 = async (url) => {
    if (!url) return null;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new window.FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };


// const handleExportMatrixExcel = async () => {
//   const exportRows = selected.length > 0
//     ? filteredProducts.filter((p) => selected.includes(p._id))
//     : filteredProducts;

//   const groupedByCategory = {};
//   exportRows.forEach((product) => {
//     const groupInfo = getVirtualGroup(product.stockType, product.gender);
//     const groupKey = groupInfo.group;
//     const articleKey = `${product.article}-${product.gender}`;
//     if (!groupedByCategory[groupKey]) groupedByCategory[groupKey] = {};
//     if (!groupedByCategory[groupKey][articleKey]) {
//       groupedByCategory[groupKey][articleKey] = {
//         article: product.article,
//         gender: product.gender,
//         stockType: product.stockType,
//         series: product.series,
//         order: groupInfo.order,
//         variants: [],
//       };
//     }
//     groupedByCategory[groupKey][articleKey].variants.push(product);
//   });

//   const categoryOrder = [
//     "EVA LADIES", "EVA GENTS", "EVA KID LADIES", "EVA KIDS GENTS",
//     "PU LADIES", "PU GENTS", "PU KID LADIES", "PU KIDS GENTS", "OTHER"
//   ];

//   const sortedCategories = Object.entries(groupedByCategory).sort(([a], [b]) => {
//     const idxA = categoryOrder.indexOf(a);
//     const idxB = categoryOrder.indexOf(b);
//     if (idxA !== -1 && idxB !== -1) return idxA - idxB;
//     if (idxA !== -1) return -1;
//     if (idxB !== -1) return 1;
//     return a.localeCompare(b);
//   });

//   for (const [, articleGroups] of sortedCategories) {
//     const articles = Object.values(articleGroups);
//     articles.sort((a, b) => {
//       const prefA = extractSeriesPref(a.series);
//       const prefB = extractSeriesPref(b.series);
//       if (prefA !== prefB) return prefA - prefB;
//       if ((a.series || '') < (b.series || '')) return -1;
//       if ((a.series || '') > (b.series || '')) return 1;
//       if ((a.article || '') < (b.article || '')) return -1;
//       if ((a.article || '') > (b.article || '')) return 1;
//       return 0;
//     });
//   }

//   const wb = new ExcelJS.Workbook();
//   const ws = wb.addWorksheet("Stock Matrix", {
//     pageSetup: { 
//       paperSize: 9,
//       orientation: 'landscape',
//       fitToPage: true,
//       fitToWidth: 1,
//       fitToHeight: 0,
//       scale: 50, // ✅ 50% zoom
//       horizontalCentered: true
//     },
//     views: [{ zoomScale: 50 }]
//   });

//   const articleImages = {};
//   if (matrixExportType === "withImage") {
//     const imagePromises = [];
//     for (const [, articles] of sortedCategories) {
//       for (const articleGroup of Object.values(articles)) {
//         const imgVariant = articleGroup.variants.find((v) => v.image);
//         if (imgVariant && imgVariant.image) {
//           imagePromises.push(
//             (async () => {
//               const base64 = await getImageBase64(imgVariant.image);
//               if (base64) {
//                 let ext = "png";
//                 const url = imgVariant.image.toLowerCase();
//                 if (url.includes(".jpg") || url.includes(".jpeg")) ext = "jpeg";
//                 else if (url.includes(".webp")) ext = "webp";
//                 else if (url.includes(".gif")) ext = "gif";
//                 articleImages[articleGroup.article] = { base64, ext };
//               }
//             })()
//           );
//         }
//       }
//     }
//     await Promise.all(imagePromises);
//   }

//   // ✅ Process each category
//   for (const [groupName, articleGroups] of sortedCategories) {
//     // ✅ Category heading only once at start
//     ws.addRow([`${groupName}`]);
//     ws.lastRow.font = { bold: true, color: { argb: 'FF1A237E' }, size: 14 };
//     ws.lastRow.height = 20;

//     const articles = Object.values(articleGroups);
//     const MAX_ROWS_PER_COLUMN = 65;
//     const COLUMNS_PER_PAGE = 3;

//     const articleBlocks = articles.map((articleGroup) => {
//       const colorMap = {};
//       articleGroup.variants.forEach((v) => {
//         const color = v.color?.trim() || "DEFAULT";
//         const size = v.size?.trim().toUpperCase();
//         if (!colorMap[color]) colorMap[color] = {};
//         colorMap[color][size] = (colorMap[color][size] || 0) + (v.cartons || 0);
//       });

//       const colorRows = [];
//       let isFirstColor = true;
//       for (const [color, sizeMap] of Object.entries(colorMap)) {
//         colorRows.push({
//           article: isFirstColor ? articleGroup.article : '',
//           color,
//           sizeMap,
//           isFirst: isFirstColor
//         });
//         isFirstColor = false;
//       }

//       return {
//         article: articleGroup.article,
//         colorRows,
//         totalRows: colorRows.length,
//         imageId: matrixExportType === "withImage" && articleImages[articleGroup.article]
//           ? wb.addImage({
//               base64: `data:image/${articleImages[articleGroup.article].ext};base64,${articleImages[articleGroup.article].base64}`,
//               extension: articleImages[articleGroup.article].ext,
//             })
//           : null
//       };
//     });

//     const columns = [];
//     let currentColumn = [];
//     let currentRowCount = 0;

//     for (const block of articleBlocks) {
//       const blockRows = block.totalRows;

//       if (currentRowCount + blockRows > MAX_ROWS_PER_COLUMN) {
//         if (currentColumn.length > 0) {
//           columns.push(currentColumn);
//           currentColumn = [];
//           currentRowCount = 0;
//         }
//       }

//       currentColumn.push(block);
//       currentRowCount += blockRows;
//     }

//     if (currentColumn.length > 0) {
//       columns.push(currentColumn);
//     }

//     // ✅ Process columns in sets of 3
//     for (let pageStart = 0; pageStart < columns.length; pageStart += COLUMNS_PER_PAGE) {
//       const pageColumns = columns.slice(pageStart, pageStart + COLUMNS_PER_PAGE);

//       // ✅ Calculate sizes per column (only non-zero quantities)
//       const columnSizes = pageColumns.map(col => {
//         const sizeSet = new Set();
//         col.forEach(block => {
//           block.colorRows.forEach(row => {
//             Object.entries(row.sizeMap).forEach(([size, qty]) => {
//               if (qty > 0) sizeSet.add(size);
//             });
//           });
//         });
//         return [...sizeSet].sort((a, b) =>
//           isNaN(a) || isNaN(b) ? a.localeCompare(b) : parseInt(a) - parseInt(b)
//         );
//       });

//       // ✅ Column headers (ART, COLOR, sizes) - NOT category name
//       const headerRow = [];
//       columnSizes.forEach(sizes => {
//         if (matrixExportType === "withImage") {
//           headerRow.push("ART", "", "COLOR", ...sizes);
//         } else {
//           headerRow.push("ART", "COLOR", ...sizes);
//         }
//       });
//       ws.addRow(headerRow);
//       ws.lastRow.font = { bold: true, size: 10 };

//       const maxRows = Math.max(...pageColumns.map(col =>
//         col.reduce((sum, block) => sum + block.totalRows, 0)
//       ));

//       const startRowNum = ws.lastRow.number + 1;
//       let colArticleIdx = pageColumns.map(() => 0);
//       let colColorIdx = pageColumns.map(() => 0);

//       // Fill rows
//       for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
//         const dataRow = [];

//         pageColumns.forEach((col, colIdx) => {
//           if (colArticleIdx[colIdx] < col.length) {
//             const block = col[colArticleIdx[colIdx]];
//             const colorRow = block.colorRows[colColorIdx[colIdx]];

//             if (colorRow) {
//               const sizes = columnSizes[colIdx];
//               if (matrixExportType === "withImage") {
//                 dataRow.push(
//                   colorRow.article,
//                   '',
//                   colorRow.color,
//                   ...sizes.map(sz => colorRow.sizeMap[sz] || '')
//                 );
//               } else {
//                 dataRow.push(
//                   colorRow.article,
//                   colorRow.color,
//                   ...sizes.map(sz => colorRow.sizeMap[sz] || '')
//                 );
//               }

//               colColorIdx[colIdx]++;
//               if (colColorIdx[colIdx] >= block.colorRows.length) {
//                 colArticleIdx[colIdx]++;
//                 colColorIdx[colIdx] = 0;
//               }
//             } else {
//               const emptyCols = matrixExportType === "withImage" 
//                 ? 3 + columnSizes[colIdx].length 
//                 : 2 + columnSizes[colIdx].length;
//               dataRow.push(...new Array(emptyCols).fill(''));
//             }
//           } else {
//             const emptyCols = matrixExportType === "withImage" 
//               ? 3 + columnSizes[colIdx].length 
//               : 2 + columnSizes[colIdx].length;
//             dataRow.push(...new Array(emptyCols).fill(''));
//           }
//         });

//         ws.addRow(dataRow);
//       }

//       // Images
//       if (matrixExportType === "withImage") {
//         pageColumns.forEach((col, colIdx) => {
//           let colOffset = 0;
//           for (let i = 0; i < colIdx; i++) {
//             colOffset += 3 + columnSizes[i].length;
//           }

//           let rowOffset = startRowNum;
//           col.forEach(block => {
//             if (block.imageId) {
//               try {
//                 ws.mergeCells(rowOffset, colOffset + 2, rowOffset + 1, colOffset + 3);
//                 ws.addImage(block.imageId, {
//                   tl: { col: colOffset + 1.1, row: rowOffset - 0.8 },
//                   ext: { width: 60, height: 60 },
//                   editAs: "oneCell"
//                 });
//               } catch (err) {
//                 console.warn(`Image skip: ${block.article}`);
//               }
//             }
//             rowOffset += block.totalRows;
//           });
//         });
//       }

//       // ✅ Page break after every 3 columns
//       if (pageStart + COLUMNS_PER_PAGE < columns.length) {
//         ws.addRow([]);
//         ws.lastRow.addPageBreak();
//       } else {
//         ws.addRow([]);
//       }
//     }
//   }

//   ws.columns.forEach((col) => { col.width = 9; });
//   const buf = await wb.xlsx.writeBuffer();
//   triggerDownload(
//     new Blob([buf], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     }),
//     'Stock-Matrix-Export.xlsx'
//   );
// };

const handleExportMatrixExcel = async () => {
  const exportRows = selected.length > 0
    ? filteredProducts.filter((p) => selected.includes(p._id))
    : filteredProducts;

  // ─── Group products by category → article ──────────────────────
  const groupedByCategory = {};
  exportRows.forEach((product) => {
    const groupInfo = getVirtualGroup(product.stockType, product.gender);
    const groupKey  = groupInfo.group;
    const articleKey = `${product.article}-${product.gender}`;
    if (!groupedByCategory[groupKey]) groupedByCategory[groupKey] = {};
    if (!groupedByCategory[groupKey][articleKey]) {
      groupedByCategory[groupKey][articleKey] = {
        article: product.article,
        gender: product.gender,
        stockType: product.stockType,
        series: product.series,
        order: groupInfo.order,
        variants: [],
      };
    }
    groupedByCategory[groupKey][articleKey].variants.push(product);
  });

  // ─── Sort categories ────────────────────────────────────────────
  const categoryOrder = [
    "EVA LADIES", "EVA GENTS", "EVA KID LADIES", "EVA KIDS GENTS",
    "PU LADIES", "PU GENTS", "PU KID LADIES", "PU KIDS GENTS", "OTHER"
  ];
  const sortedCategories = Object.entries(groupedByCategory).sort(([a], [b]) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  // ─── Sort articles within each category ────────────────────────
  for (const [, articleGroups] of sortedCategories) {
    Object.values(articleGroups).sort((a, b) => {
      const prefA = extractSeriesPref(a.series);
      const prefB = extractSeriesPref(b.series);
      if (prefA !== prefB) return prefA - prefB;
      if ((a.series || '') < (b.series || '')) return -1;
      if ((a.series || '') > (b.series || '')) return 1;
      if ((a.article || '') < (b.article || '')) return -1;
      if ((a.article || '') > (b.article || '')) return 1;
      return 0;
    });
  }

  // ─── Workbook setup ─────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Stock Matrix", {
    pageSetup: {
      paperSize: 9,           // A4
      orientation: 'landscape',
      fitToPage: false,       // ✅ false — use scale instead of fitTo
      scale: 58,              // ✅ 58% scale on landscape A4 fits 3 columns perfectly
      horizontalCentered: true,
    },
    views: [{ zoomScale: 100 }]
  });
  ws.properties.defaultRowHeight = 15;

  // ─── Styles ─────────────────────────────────────────────────────
  // At 65% print scale, font 9 prints like ~6pt — same as the PDF
  const FONT_SIZE   = 12;
  const HDR_SIZE    = 12;
  const CAT_SIZE    = 14;
  const ROW_HEIGHT  = 15;
  const HDR_HEIGHT  = 16;
  const CAT_HEIGHT  = 19;

  const NEG_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
  const HDR_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  const CAT_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
  const ART_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } };

  const NEG_FONT  = { bold: true, color: { argb: 'FFFFFFFF' }, size: FONT_SIZE, name: 'Arial' };
  const CAT_FONT  = { bold: true, color: { argb: 'FF1A237E' }, size: CAT_SIZE,  name: 'Arial' };
  const HDR_FONT  = { bold: true,                               size: HDR_SIZE,  name: 'Arial' };
  const ART_FONT  = { bold: true,                               size: FONT_SIZE, name: 'Arial' };
  const CLR_FONT  = {                                            size: FONT_SIZE, name: 'Arial', italic: true };
  const NUM_FONT  = {                                            size: FONT_SIZE, name: 'Arial' };

  const centerAlign = { horizontal: 'center', vertical: 'middle', wrapText: false, shrinkToFit: false, indent: 0 };
  const leftAlign   = { horizontal: 'left',   vertical: 'middle', wrapText: false, shrinkToFit: false, indent: 0 };

  const thinBorder = {
    top:    { style: 'thin', color: { argb: 'FFBDBDBD' } },
    bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
    left:   { style: 'thin', color: { argb: 'FFBDBDBD' } },
    right:  { style: 'thin', color: { argb: 'FFBDBDBD' } },
  };

  // ─── Images ─────────────────────────────────────────────────────
  const articleImages = {};
  if (matrixExportType === "withImage") {
    const imagePromises = [];
    for (const [, articles] of sortedCategories) {
      for (const articleGroup of Object.values(articles)) {
        const imgVariant = articleGroup.variants.find((v) => v.image);
        if (imgVariant?.image) {
          imagePromises.push((async () => {
            const base64 = await getImageBase64(imgVariant.image);
            if (base64) {
              let ext = "png";
              const url = imgVariant.image.toLowerCase();
              if (url.includes(".jpg") || url.includes(".jpeg")) ext = "jpeg";
              else if (url.includes(".webp")) ext = "webp";
              else if (url.includes(".gif"))  ext = "gif";
              articleImages[articleGroup.article] = { base64, ext };
            }
          })());
        }
      }
    }
    await Promise.all(imagePromises);
  }

  // ─── Helper: style a data cell ──────────────────────────────────
  const styleCell = (cell, value, { isNeg = false, isArt = false, isClr = false, isHdr = false, isCat = false } = {}) => {
    cell.value  = value === 0 ? '' : value; // show 0 as blank
    cell.border = thinBorder;

    if (isCat) {
      cell.font      = CAT_FONT;
      cell.fill      = CAT_FILL;
      cell.alignment = leftAlign;
    } else if (isHdr) {
      cell.font      = HDR_FONT;
      cell.fill      = HDR_FILL;
      cell.alignment = centerAlign;
    } else if (isNeg) {
      cell.font      = NEG_FONT;
      cell.fill      = NEG_FILL;
      cell.alignment = centerAlign;
    } else if (isArt) {
      cell.font      = ART_FONT;
      cell.fill      = ART_FILL;
      cell.alignment = leftAlign;
    } else if (isClr) {
      cell.font      = CLR_FONT;
      cell.alignment = leftAlign;
    } else {
      cell.font      = NUM_FONT;
      cell.alignment = centerAlign;
    }
  };

  // ─── Build article blocks (pre-processed) ───────────────────────
  const buildBlocks = (articleGroups) => {
    return Object.values(articleGroups).map((articleGroup) => {
      const colorMap = {};
      articleGroup.variants.forEach((v) => {
        const color = v.color?.trim() || "DEFAULT";
        const size  = v.size?.trim().toUpperCase();
        if (!colorMap[color]) colorMap[color] = {};
        colorMap[color][size] = (colorMap[color][size] || 0) + (v.cartons || 0);
      });

      const colorRows = [];
      let isFirst = true;
      for (const [color, sizeMap] of Object.entries(colorMap)) {
        // skip rows where ALL sizes are exactly 0 (negatives still show)
        const hasAnyNonZero = Object.values(sizeMap).some(q => q !== 0);
        if (!hasAnyNonZero) continue;
        colorRows.push({ article: isFirst ? articleGroup.article : '', color, sizeMap, isFirst });
        isFirst = false;
      }

      if (!colorRows.length) return null;

      return {
        article: articleGroup.article,
        colorRows,
        totalRows: colorRows.length,
        imageId: matrixExportType === "withImage" && articleImages[articleGroup.article]
          ? wb.addImage({
              base64: `data:image/${articleImages[articleGroup.article].ext};base64,${articleImages[articleGroup.article].base64}`,
              extension: articleImages[articleGroup.article].ext,
            })
          : null
      };
    }).filter(Boolean);
  };

  // ─── Smart column distribution ──────────────────────────────────
  // Instead of just filling left→right, distribute articles evenly across
  // up to COLUMNS_PER_PAGE columns so small categories look balanced.
  const MAX_ROWS_PER_COL  = 55;   // rows before forcing a new column
  const COLUMNS_PER_PAGE  = 3;

  const packIntoColumns = (blocks) => {
    const totalRows = blocks.reduce((s, b) => s + b.totalRows, 0);

    // For small categories: aim to fill columns evenly
    const idealRowsPerCol = Math.ceil(totalRows / COLUMNS_PER_PAGE);
    const rowLimit = Math.min(MAX_ROWS_PER_COL, Math.max(idealRowsPerCol, 10));

    const columns = [];
    let cur = [], curRows = 0;
    for (const block of blocks) {
      if (curRows + block.totalRows > rowLimit && cur.length > 0) {
        columns.push(cur);
        cur = [];
        curRows = 0;
      }
      cur.push(block);
      curRows += block.totalRows;
    }
    if (cur.length > 0) columns.push(cur);
    return columns;
  };

  // ─── Render a page-set (3 columns) ──────────────────────────────
  const renderPageSet = (pageColumns, groupName, isFirstPageOfCategory) => {

    // ── Category heading row (always printed at start of each page-set) ──
    const catRow = ws.addRow([groupName]);
    catRow.height = CAT_HEIGHT;
    styleCell(catRow.getCell(1), groupName, { isCat: true });

    // ── Compute sizes per column (only non-zero totals) ──
    const columnSizes = pageColumns.map(col => {
      const sizeQty = {};
      col.forEach(block => {
        block.colorRows.forEach(row => {
          Object.entries(row.sizeMap).forEach(([size, qty]) => {
            sizeQty[size] = (sizeQty[size] || 0) + qty;
          });
        });
      });
      return Object.entries(sizeQty)
        .filter(([, total]) => total !== 0)
        .map(([size]) => size)
        .sort((a, b) => {
          const na = parseFloat(a), nb = parseFloat(b);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return a.localeCompare(b);
        });
    });

    // ── Column offsets ──
    const colOffsets = [];
    let offset = 1;
    pageColumns.forEach((_, ci) => {
      colOffsets.push(offset);
      const w = matrixExportType === "withImage"
        ? 3 + columnSizes[ci].length
        : 2 + columnSizes[ci].length;
      offset += w;
    });

    // ── Header row ──
    const hdrRow = ws.addRow([]);
    hdrRow.height = HDR_HEIGHT;
    pageColumns.forEach((_, ci) => {
      const base  = colOffsets[ci];
      const sizes = columnSizes[ci];
      if (matrixExportType === "withImage") {
        styleCell(hdrRow.getCell(base),     "ART",   { isHdr: true });
        styleCell(hdrRow.getCell(base + 1), "",      { isHdr: true });
        styleCell(hdrRow.getCell(base + 2), "COLOR", { isHdr: true });
        sizes.forEach((sz, si) => styleCell(hdrRow.getCell(base + 3 + si), sz, { isHdr: true }));
      } else {
        styleCell(hdrRow.getCell(base),     "ART",   { isHdr: true });
        styleCell(hdrRow.getCell(base + 1), "COLOR", { isHdr: true });
        sizes.forEach((sz, si) => styleCell(hdrRow.getCell(base + 2 + si), sz, { isHdr: true }));
      }
    });

    // ── Data rows ──
    const maxRows    = Math.max(...pageColumns.map(col => col.reduce((s, b) => s + b.totalRows, 0)));
    const startRowNum = ws.lastRow.number + 1;
    const artIdx     = pageColumns.map(() => 0);
    const clrIdx     = pageColumns.map(() => 0);

    for (let r = 0; r < maxRows; r++) {
      const dataRow = ws.addRow([]);
      dataRow.height = ROW_HEIGHT;

      pageColumns.forEach((col, ci) => {
        const base  = colOffsets[ci];
        const sizes = columnSizes[ci];
        const empty = matrixExportType === "withImage" ? 3 + sizes.length : 2 + sizes.length;

        if (artIdx[ci] < col.length) {
          const block    = col[artIdx[ci]];
          const colorRow = block.colorRows[clrIdx[ci]];

          if (colorRow) {
            if (matrixExportType === "withImage") {
              styleCell(dataRow.getCell(base),     colorRow.article, { isArt: colorRow.isFirst });
              styleCell(dataRow.getCell(base + 1), '',               {});
              styleCell(dataRow.getCell(base + 2), colorRow.color,   { isClr: true });
              sizes.forEach((sz, si) => {
                const qty = colorRow.sizeMap[sz];
                const val = (qty === undefined || qty === 0) ? '' : qty;
                styleCell(dataRow.getCell(base + 3 + si), val, { isNeg: typeof val === 'number' && val < 0 });
              });
            } else {
              styleCell(dataRow.getCell(base),     colorRow.article, { isArt: colorRow.isFirst });
              styleCell(dataRow.getCell(base + 1), colorRow.color,   { isClr: true });
              sizes.forEach((sz, si) => {
                const qty = colorRow.sizeMap[sz];
                const val = (qty === undefined || qty === 0) ? '' : qty;
                styleCell(dataRow.getCell(base + 2 + si), val, { isNeg: typeof val === 'number' && val < 0 });
              });
            }

            clrIdx[ci]++;
            if (clrIdx[ci] >= block.colorRows.length) {
              artIdx[ci]++;
              clrIdx[ci] = 0;
            }
          } else {
            for (let e = 0; e < empty; e++) styleCell(dataRow.getCell(base + e), '', {});
          }
        } else {
          for (let e = 0; e < empty; e++) styleCell(dataRow.getCell(base + e), '', {});
        }
      });
    }

    // ── Images ──
    if (matrixExportType === "withImage") {
      pageColumns.forEach((col, ci) => {
        const base0 = colOffsets[ci] - 1; // 0-based
        let rowOff  = startRowNum;
        col.forEach(block => {
          if (block.imageId !== null) {
            try {
              ws.addImage(block.imageId, {
                tl: { col: base0 + 1.05, row: rowOff - 0.9 },
                ext: { width: 55, height: 55 },
                editAs: "oneCell"
              });
            } catch (e) { console.warn("Image skip:", block.article); }
          }
          rowOff += block.totalRows;
        });
      });
    }
  };

  // ─── Main render loop ────────────────────────────────────────────
  let firstCategory = true;

  for (const [groupName, articleGroups] of sortedCategories) {
    const blocks = buildBlocks(articleGroups);
    if (!blocks.length) continue;

    const columns    = packIntoColumns(blocks);
    const pageSets   = [];
    for (let i = 0; i < columns.length; i += COLUMNS_PER_PAGE) {
      pageSets.push(columns.slice(i, i + COLUMNS_PER_PAGE));
    }

    // Each category starts on a fresh page (except the very first)
    if (!firstCategory) {
      ws.addRow([]); // no page break - continue on same page
    }
    firstCategory = false;

    pageSets.forEach((pageSet, psIdx) => {
      // Subsequent page-sets within same category also get a page break before them
      if (psIdx > 0) {
        ws.addRow([]).addPageBreak();
      }
      renderPageSet(pageSet, groupName, psIdx === 0);
    });
  }

  // ─── Column widths ───────────────────────────────────────────────
  // ART cols = wider, size cols = narrow, color cols = medium
  // Column widths: scan every cell to find max content per column
  // Track ART/COLOR positions from header rows, everything else = size col
  const colMaxLen   = {};
  const artColNums  = new Set();
  const colorColNums = new Set();

  ws.eachRow((row) => {
    row.eachCell({ includeEmpty: false }, (cell, colNum) => {
      const v = String(cell.value ?? '');
      if (v === 'ART')   artColNums.add(colNum);
      if (v === 'COLOR') colorColNums.add(colNum);
      if (!colMaxLen[colNum] || v.length > colMaxLen[colNum])
        colMaxLen[colNum] = v.length;
    });
  });

  // COLOR col is always the one immediately after ART col
  artColNums.forEach(n => colorColNums.add(n + 1));

  ws.columns.forEach((col, idx) => {
    const colNum = idx + 1;
    const maxLen = colMaxLen[colNum] || 3;
    if (artColNums.has(colNum))         col.width = Math.max(maxLen * 1.2 + 1, 12);
    else if (colorColNums.has(colNum))  col.width = Math.max(maxLen * 1.2 + 1, 10);
    else                                col.width = 4; // ✅ ALL size cols = fixed 4, no exceptions
  });

  // Print settings
  ws.pageSetup.margins = {
    left: 0.15, right: 0.15,
    top: 0.2,   bottom: 0.2,
    header: 0.1, footer: 0.1,
  };

  const buf = await wb.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    'Stock-Matrix-Export.xlsx'
  );
};


const handleGeneratePDF = async () => {
  let idsToExport = [];
  let additionalImageIds = [];
  
  if (selected.length > 0) {
    idsToExport = selected;
    const selectedGroups = {};
    const selectedProducts = filteredProducts.filter(p => selected.includes(p._id));
    const zeroStockSelected = selectedProducts.filter(
      p => (p.totalPairs || (p.cartons * p.pairPerCarton)) === 0
    );
    if (zeroStockSelected.length > 0) {
      alert('Warning: आपने zero stock वाले products select किए हैं। कृपया valid stock वाले products select करें।');
      return;
    }
    selectedProducts.forEach(p => {
      const groupKey = `${p.article}-${p.gender}`;
      if (!selectedGroups[groupKey]) {
        const group = groupedProducts[groupKey];
        if (group && group.variants) {
          const imageProduct = group.variants.find(v => v.image);
          if (imageProduct && !selected.includes(imageProduct._id)) {
            additionalImageIds.push(imageProduct._id);
          }
        }
        selectedGroups[groupKey] = true;
      }
    });
    idsToExport = [...selected, ...additionalImageIds];
  } else {
    idsToExport = filteredProducts.map(p => p._id);
  }

  if (idsToExport.length === 0) {
    alert('कृपया कम से कम 1 प्रोडक्ट चुनें');
    return;
  }

  try {
    setPdfLoading(true); // ✅ Start loading
    
    const response = await api.post('/pdf/generate-pdf', {
      productIds: idsToExport,
      includeImages: pdfExportType === "withImage",
      showRate: showRate,
      showMRP: showMRP,
      filters: {}
    }, { 
      responseType: 'blob',
      timeout: 60000 // ✅ 60 second timeout
    });

    triggerDownload(
      new Blob([response.data], { type: 'application/pdf' }),
      'catalogue.pdf'
    );
  } catch (err) {
    console.error('PDF Error:', err);
    if (err.code === 'ECONNABORTED') {
      alert('⏱️ PDF generation is taking longer than expected. Please try selecting fewer products or try again.');
    } else {
      alert('❌ PDF download failed. Please try again.');
    }
  } finally {
    setPdfLoading(false); // ✅ Stop loading
  }
};


  const renderTableRows = () => {
    const rows = [];
    const groupEntries = Object.entries(groupedProducts);

    const defaultSort = (a, b) => {
      const groupA = a[1];
      const groupB = b[1];
      const categoryOrder = [
        "EVA LADIES", "EVA GENTS", "EVA KID LADIES", "EVA KIDS GENTS",
        "PU LADIES", "PU GENTS", "PU KID LADIES", "PU KIDS GENTS", "OTHER"
      ];
      const groupInfoA = getVirtualGroup(groupA.variants[0]?.stockType, groupA.gender);
      const groupInfoB = getVirtualGroup(groupB.variants[0]?.stockType, groupB.gender);
      const orderA = categoryOrder.indexOf(groupInfoA.group);
      const orderB = categoryOrder.indexOf(groupInfoB.group);
      if (orderA !== orderB) return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
      const prefA = extractSeriesPref(groupA.variants[0]?.series);
      const prefB = extractSeriesPref(groupB.variants[0]?.series);
      if (prefA !== prefB) return prefA - prefB;
      if ((groupA.variants[0]?.series || '') < (groupB.variants[0]?.series || '')) return -1;
      if ((groupA.variants[0]?.series || '') > (groupB.variants[0]?.series || '')) return 1;
      if ((groupA.article || '') < (groupB.article || '')) return -1;
      if ((groupA.article || '') > (groupB.article || '')) return 1;
      return 0;
    };

    const groupLevelKeys = ['article', 'gender', 'stockType', 'series'];
    const varLevelKeys   = ['mrp', 'rate', 'cartons', 'pairPerCarton', 'color', 'size'];

    if (sortConfig.key && groupLevelKeys.includes(sortConfig.key)) {
      groupEntries.sort((a, b) => {
        const ga = a[1], gb = b[1];
        const va = sortConfig.key === 'article' ? ga.article
                 : sortConfig.key === 'gender'   ? ga.gender
                 : ga.variants[0]?.[sortConfig.key] || '';
        const vb = sortConfig.key === 'article' ? gb.article
                 : sortConfig.key === 'gender'   ? gb.gender
                 : gb.variants[0]?.[sortConfig.key] || '';
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    } else if (sortConfig.key && varLevelKeys.includes(sortConfig.key)) {
      groupEntries.sort(defaultSort);
      groupEntries.forEach(([, grp]) => {
        grp.variants.sort((a, b) => {
          const va = a[sortConfig.key] ?? '';
          const vb = b[sortConfig.key] ?? '';
          const cmp = typeof va === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb), undefined, { numeric: true });
          return sortConfig.dir === 'asc' ? cmp : -cmp;
        });
      });
    } else {
      groupEntries.sort(defaultSort);
    }
    
    groupEntries.forEach(([groupKey, group], groupIndex) => {
      group.variants.forEach((product, index) => {
        const isFirstInGroup = index === 0;
        const groupSize = group.variants.length;

        const isLow = lowStockThreshold > 0 && product.cartons <= lowStockThreshold;
        rows.push(
          <tr key={product._id} className={isLow ? 'row-low-stock' : ''}>
            <td>
              <input
                type="checkbox"
                checked={selected.includes(product._id)}
                onChange={() => handleSelect(product._id)}
              />
            </td>
            {isFirstInGroup && (
              <td rowSpan={groupSize} className="text-center align-middle bg-light border-span">
                <strong>{group.article}</strong>
              </td>
            )}
            {isFirstInGroup && (
              <td rowSpan={groupSize} className="text-center align-middle border-span">
                {group.gender}
              </td>
            )}
            {isFirstInGroup && (
              <td rowSpan={groupSize} className="text-center align-middle border-span">
                {group.image ? (
                  <img src={group.image} alt={group.article} className="product-image" />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </td>
            )}
            {isFirstInGroup && (
              <td rowSpan={groupSize} className="text-center align-middle border-span">
                {product.series || '-'}
              </td>
            )}
            {isFirstInGroup && (
              <td rowSpan={groupSize} className="text-center align-middle border-span">
                {product.stockType}
              </td>
            )}
            <td className="text-center">₹{product.mrp}</td>
            <td className="text-center">₹{product.rate}</td>
            <td>{product.color}</td>
            <td>{product.size}</td>
            <td className={isLow ? 'cell-low-stock' : ''}>
              {isLow ? '⚠️ ' : ''}{product.cartons}
            </td>
            <td>{product.pairPerCarton}</td>
            <td>{product.createdBy || '-'}</td>
          </tr>
        );
      });
      if (groupIndex < groupEntries.length - 1) {
        rows.push(
          <tr key={`separator-${groupKey}`}>
            <td colSpan="15" style={{ borderBottom: '2px solid #222', background: '#eee', padding: 0 }}></td>
          </tr>
        );
      }
    });
    return rows;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .border-span { background: #eef2ff !important; border-left: 4px solid #6366f1 !important; }
        .product-image { width: 54px; height: 54px; border-radius: 10px; object-fit: cover; border: 2px solid #e2e8f0; display: block; margin: 0 auto; }
        .no-image { width: 54px; height: 54px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-style: italic; margin: 0 auto; }
        .dropdown-menu.show { box-shadow: 0 8px 24px rgba(60,72,126,0.14) !important; background: white !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; }
        .btn-outline-secondary { border-color: #e2e8f0 !important; color: #64748b !important; border-radius: 10px !important; font-size: 0.8rem !important; font-weight: 500 !important; }
        .btn-outline-secondary:hover { background: rgba(99,102,241,0.08) !important; border-color: #6366f1 !important; color: #6366f1 !important; }
      `}</style>

      {/* ── Page Header ── */}
      <div className="prod-page-header">
        <div className="container-fluid" style={{ padding: '0 24px' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="prod-page-title">📦 {title || 'All Products'}</h1>
              <p className="prod-page-sub">
                {loading ? 'Loading products…' : `${filteredProducts.length} products`}
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {selected.length > 0 && (
                <span className="prod-badge prod-badge-selected">✓ {selected.length} selected</span>
              )}
              <span className="prod-badge">📦 {filteredProducts.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="container-fluid" style={{ padding: '24px' }}>
        <div className="prod-card">

          {/* Search + Filters */}
          <div className="prod-toolbar">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
              <SearchBar
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search article, color, size, series…"
              />
              <span className="search-shortcut-hint" title="Press / to focus">/</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>⚠️ Low ≤</span>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  style={{ width: 62, background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)', borderRadius: 8, padding: '6px 8px', fontSize: '0.84rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>cartons</span>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <CheckboxFilter label="Sizes" options={uniqueSizes} selected={filter.size} onChange={handleFilterChange} name="size" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Colors" options={uniqueColors} selected={filter.color} onChange={handleFilterChange} name="color" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Genders" options={uniqueGenders} selected={filter.gender} onChange={handleFilterChange} name="gender" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Articles" options={uniqueArticles} selected={filter.article} onChange={handleFilterChange} name="article" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Stock Types" options={uniqueStockTypes} selected={filter.stockType} onChange={handleFilterChange} name="stockType" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Pair/Carton" options={uniquePairPerCartons.map(String)} selected={filter.pairPerCarton} onChange={handleFilterChange} name="pairPerCarton" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="MRP" options={uniqueMRPs.map(String)} selected={filter.mrp} onChange={handleFilterChange} name="mrp" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Rates" options={uniqueRates.map(String)} selected={filter.rate} onChange={handleFilterChange} name="rate" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
              <CheckboxFilter label="Series" options={uniqueSeries} selected={filter.series} onChange={handleFilterChange} name="series" openFilter={openFilter} setOpenFilter={setOpenFilter} dropdownMenuRef={dropdownMenuRef} />
            </div>
          </div>

          {/* Export Bar */}
          <div className="prod-export-row">
            <div className="d-flex gap-2 align-items-center">
              <select className="prod-select" value={matrixExportType} onChange={e => setMatrixExportType(e.target.value)}>
                <option value="withoutImage">Excel (No Image)</option>
                <option value="withImage">Excel (With Image)</option>
              </select>
              <button className="prod-btn-excel" onClick={handleExportMatrixExcel}>
                📊 Export Excel
              </button>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <select className="prod-select" value={pdfExportType} onChange={e => setPdfExportType(e.target.value)} disabled={pdfLoading}>
                <option value="withImage">PDF (With Image)</option>
              </select>
              <button className="prod-btn-pdf" onClick={handleGeneratePDF} disabled={pdfLoading}>
                {pdfLoading ? (
                  <>
                    <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Generating…
                  </>
                ) : '📄 Export PDF'}
              </button>
            </div>

            <div className="d-flex gap-3" style={{ paddingLeft: 14, borderLeft: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" checked={showRate} onChange={e => setShowRate(e.target.checked)} />
                Show Rate
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" checked={showMRP} onChange={e => setShowMRP(e.target.checked)} />
                Show MRP
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="prod-table-wrap">
            {loading ? (
              <div className="prod-empty">
                <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b', margin: 0 }}>Loading products…</p>
              </div>
            ) : Object.keys(groupedProducts).length === 0 ? (
              <div className="prod-empty">
                <span className="prod-empty-icon">🔍</span>
                <h5 style={{ color: '#1e293b', marginBottom: 8 }}>No products found</h5>
                <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="prod-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox"
                        checked={selected.length > 0 && selected.length === filteredProducts.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {[
                      { key: 'article',      label: 'Article' },
                      { key: 'gender',       label: 'Gender' },
                    ].map(({ key, label }) => (
                      <th key={key} className="sort-th" onClick={() => handleSort(key)}>
                        {label}
                        <span className="sort-icon">
                          {sortConfig.key === key ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </th>
                    ))}
                    <th>Image</th>
                    {[
                      { key: 'series',       label: 'Series' },
                      { key: 'stockType',    label: 'Stock Type' },
                      { key: 'mrp',          label: 'MRP' },
                      { key: 'rate',         label: 'Rate' },
                      { key: 'color',        label: 'Color' },
                      { key: 'size',         label: 'Size' },
                      { key: 'cartons',      label: 'Cartons' },
                      { key: 'pairPerCarton',label: 'Pair/Carton' },
                    ].map(({ key, label }) => (
                      <th key={key} className="sort-th" onClick={() => handleSort(key)}>
                        {label}
                        <span className="sort-icon">
                          {sortConfig.key === key ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </th>
                    ))}
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductListTable;



