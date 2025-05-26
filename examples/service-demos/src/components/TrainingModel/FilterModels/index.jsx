import { useState } from 'react';
import { ReactComponent as FilterIcon } from "../../../assets/images/FilterIcon.svg"
import { serviceStatus } from 'snet-sdk-core/training/TrainingConstants';
import './styles.css';
import PopUp from '../../PopUp';

const FilterModels = ({ trainingMetadata, onFilterApply }) => {
    const [isFiltersView, setIsFiltersView] = useState(false);
    const initiateFilterState = {
        grpcMethod: trainingMetadata?.grpcServiceMethod,
        serviceName:  trainingMetadata?.grpcServiceName,
        name: '',
        statuses: [],
        isPublic: null,
        createdByAddress: '',
        pageSize: 10,
        page: 0,
    }
    const [filters, setFilters] = useState(initiateFilterState);
    
    const resetFilter = () => {
        setFilters(initiateFilterState)
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e) => {
        const { value, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            statuses: checked
                ? [...prev.statuses, parseInt(value)]
                : prev.statuses.filter(status => status !== parseInt(value))
        }));
    };

    const handleIsPublicChange = (e) => {
        const { value } = e.target;
        setFilters(prev => ({ ...prev, isPublic: value === 'null' ? null : value === 'true' }));
    };

    const handleApply = () => {  
        onFilterApply(filters);
    };

    const toggleFilterVisibility = () => {
        setIsFiltersView(!isFiltersView)
    }

    const grpcMethods = trainingMetadata.trainingmethodsMap[0][1].valuesList;

    return (
        <div className="filters-container">
            <div className="button-group">
                <button  className="filter-button" onClick={toggleFilterVisibility}>
                    <FilterIcon />
                </button>
                <button onClick={handleApply}>Get All Models</button>
            </div>
            <PopUp isPopupView={isFiltersView} closePopUp={() => setIsFiltersView(false)}>
                <div className="filter-group">
                    <button onClick={resetFilter}>Reset</button>
                    <label>GRPC Method:</label>
                    <select name="grpcMethod" value={filters.grpcMethod} onChange={handleChange}>
                        <option value="">Select GRPC Method</option>
                        {grpcMethods.map(method => (
                            <option key={method.stringValue} value={method.stringValue}>{method.stringValue}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Service Name:</label>
                    <select name="serviceName" value={filters.serviceName} onChange={handleChange}>
                        <option value="">Select Service Name</option>
                        {trainingMetadata.trainingmethodsMap.map(service => (
                            <option key={service[0]} value={service[0]}>{service[0]}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Name:</label>
                    <input type="text" name="name" value={filters.name} onChange={handleChange} />
                </div>
                <div className="filter-group">
                    <label>Statuses:</label>
                    {Object.entries(serviceStatus).map(([key, value]) => (
                        <label key={key}>
                            <span>{value}</span>
                            <input
                                type="checkbox"
                                value={key}
                                checked={filters.statuses.includes(parseInt(key))}
                                onChange={handleStatusChange}
                            />
                        </label>
                    ))}
                </div>
                <div className="filter-group">
                    <label>Is Public:</label>
                    <select name="isPublic" value={filters.isPublic} onChange={handleIsPublicChange}>
                        <option value="null">All</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Created By Address:</label>
                    <input type="text" name="createdByAddress" value={filters.createdByAddress} onChange={handleChange} />
                </div>
                <div className="filter-group">
                    <label>Page Size:</label>
                    <input type="number" name="pageSize" value={filters.pageSize} onChange={handleChange} />
                </div>
                <div className="filter-group">
                    <label>Page:</label>
                    <input type="number" name="page" value={filters.page} onChange={handleChange} />
                </div>
            </PopUp>
        </div>
    );
};

export default FilterModels;