import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import AuthContext from "../../../../config/authContext";
import { IUser, IPromotion, ICenter, IRole } from "../../../../types";

interface CreateUserProps {
  isEditMode: boolean;
  existingUser?: IUser;
}

const CreateUser: React.FC<CreateUserProps> = ({ isEditMode, existingUser }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [roles, setRoles] = useState<IRole[]>([]);
  const [centers, setCenters] = useState<ICenter[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [selectedPromotions, setSelectedPromotions] = useState<number[]>([]);
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [centerId, setCenterId] = useState<number | null>(null);
  const [pilotPromotions, setPilotPromotions] = useState<string[]>([]);

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    axios.get('https://localhost:8000/api/roles', config)
      .then(response => {
        setRoles(response.data);
      })
      .catch(error => {
        console.error("Error fetching roles:", error);
      });

    axios.get('https://localhost:8000/api/centers', config)
      .then(response => {
        setCenters(response.data);
      })
      .catch(error => {
        console.error("Error fetching centers:", error);
      });

    axios.get('https://localhost:8000/api/promotion', config)
      .then(response => {
        setPromotions(response.data);
      })
      .catch(error => {
        console.error("Error fetching promotions:", error);
      });

    if (isEditMode && existingUser) {
      console.log(existingUser.role.id); // log the role id
    console.log(existingUser.center.id); 
      setRoleId(existingUser.role.id);
      setEmail(existingUser.email);
      setFirstName(existingUser.firstName);
      setLastName(existingUser.lastName);
      setPassword(existingUser.password);
      setCenterId(existingUser.center.id);

      if (Array.isArray(existingUser.promotions)) {
        setSelectedPromotions((existingUser.promotions as IPromotion[]).map(promotion => promotion.id));
      } else if (existingUser.promotions && typeof existingUser.promotions === 'object') {
        setSelectedPromotions([(existingUser.promotions as IPromotion).id]);
      }
    }
     // Fetch pilot promotions if the selected role is "pilot"
  if (roleId === 2) {
    axios.get('https://localhost:8000/api/pilot_promotions', config)
      .then(response => {
        setPilotPromotions(response.data);
      })
      .catch(error => {
        console.error("Error fetching pilot promotions:", error);
      });
  }
  }, [token, isEditMode, existingUser]);

  const displayedPromotions =
  roleId === 2
    ? promotions.filter((promotion: IPromotion) => !pilotPromotions.includes(promotion.promo))
    : promotions;

  const handleRoleChange = (event: SelectChangeEvent<number>) => {
    const roleId = event.target.value as number;
    setRoleId(roleId);
    setSelectedPromotions([]);
  };

  const handlePromotionIdsChange = (event: SelectChangeEvent<number | number[]>) => {
    const selectedPromotions = Array.isArray(event.target.value) ? event.target.value : [event.target.value as number];
    setSelectedPromotions(selectedPromotions);
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (roleId === null || centerId === null) {
    console.error("Role and center must be selected.");
    return;
  }

  const userData = {
    email: email,
    firstName: firstName,
    lastName: lastName,
    password: password,
    roleId: roleId,
    promotionIds: selectedPromotions,
    centerId: centerId,
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  if (isEditMode && existingUser) {
    // update the existing user with a PUT request
    axios.put(`https://localhost:8000/api/update_user/${existingUser.id}`, userData, config)
      .then(() => {
        navigate("/admin/users");
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // create a new user with a POST request
    axios.post("https://localhost:8000/api/create_user", userData, config)
      .then(() => {
        navigate("/admin/users");
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          name="firstName"
          label="Nom"
          variant="outlined"
          fullWidth
          margin="normal"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          name="lastName"
          label="Prénom"
          variant="outlined"
          fullWidth
          margin="normal"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          name="password"
          label="Mot de passe"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel id="role-select-label">Rôle</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            value={roleId || ""}
            label="Rôle"
            onChange={handleRoleChange}
          >
            {roles.map((role: IRole) => (
              <MenuItem key={role.id} value={role.id}>
                {role.role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="center-label">Centre</InputLabel>
          <Select
            labelId="center-label"
            value={centerId || ""}
            onChange={(e) => setCenterId(e.target.value as number)}
            label="Centre"
            name="center"
          >
            {centers.map((center: ICenter) => (
              <MenuItem key={center.id} value={center.id}>{center.center}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(roleId === 2 || roleId === 3) && (
          <FormControl variant="outlined" fullWidth margin="normal">
            <InputLabel id="promotion-label">Promotion{roleId === 3 ? '' : 's'}</InputLabel>
            <Select
              labelId="promotion-label"
              multiple={roleId === 2}
              value={selectedPromotions}
              onChange={handlePromotionIdsChange}
              label="Promotions"
              name="promotion"
            >
              {displayedPromotions.map((promotion: IPromotion) => (
                <MenuItem key={promotion.id} value={promotion.id}>
                  {promotion.promo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button type="submit" variant="contained" color="primary">
          Enregistrer
        </Button>
      </form>
    </Box>
  );
};

export default CreateUser;